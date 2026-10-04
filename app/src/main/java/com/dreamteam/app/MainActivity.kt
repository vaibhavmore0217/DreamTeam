package com.dreamteam.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.SslErrorHandler
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebStorage
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

private const val HOME = "https://dreamteamera.blogspot.com"
private val RED = Color(0xFFD32F2F)
private val GREEN = Color(0xFF2E7D32)

class MainActivity : ComponentActivity() {

    private var fileCallback: ValueCallback<Array<Uri>>? = null
    private val message = mutableStateOf<String?>(null)

    private val chooser = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { r ->
        fileCallback?.onReceiveValue(
            WebChromeClient.FileChooserParams.parseResult(r.resultCode, r.data)
        )
        fileCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
        CookieManager.getInstance().removeAllCookies(null)
        WebStorage.getInstance().deleteAllData()
        setContent { MaterialTheme { App() } }
    }

    // ---------- permission state (check only, never request) ----------
    private fun granted(p: String) =
        ContextCompat.checkSelfPermission(this, p) == PackageManager.PERMISSION_GRANTED

    private fun locationOk() =
        granted(Manifest.permission.ACCESS_FINE_LOCATION) ||
            granted(Manifest.permission.ACCESS_COARSE_LOCATION)

    private fun storageOk() =
        if (Build.VERSION.SDK_INT >= 33) granted(Manifest.permission.READ_MEDIA_IMAGES)
        else granted(Manifest.permission.READ_EXTERNAL_STORAGE)

    private fun openAppSettings() {
        startActivity(
            Intent(
                Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", packageName, null)
            )
        )
    }

    // ---------- screens ----------
    @Composable
    private fun App() {
        var tick by remember { mutableIntStateOf(0) }
        var results by remember { mutableStateOf<List<CheckResult>?>(null) }
        LaunchedEffect(tick) {
            results = null
            delay(800)
            results = withContext(Dispatchers.Default) {
                SecurityChecks.runAll(this@MainActivity)
            }
        }
        val r = results
        when {
            r == null -> AuditScreen()
            r.any { it.failed } -> Dashboard(r) { tick++ }
            else -> BrowserScreen()
        }
    }

    @Composable
    private fun AuditScreen() {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Card(Modifier.padding(24.dp)) {
                Column(
                    Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Filled.Lock, null, Modifier.size(48.dp))
                    Box(Modifier.size(16.dp))
                    CircularProgressIndicator()
                    Box(Modifier.size(16.dp))
                    Text("Performing secure system audits...")
                }
            }
        }
    }

    @Composable
    private fun Dashboard(list: List<CheckResult>, onRetry: () -> Unit) {
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            list.forEach { c ->
                Card(Modifier.fillMaxWidth()) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(c.name)
                        Box(
                            Modifier
                                .background(
                                    if (c.failed) RED else GREEN,
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                if (c.failed) "ON - Please disable" else "OFF",
                                color = Color.White
                            )
                        }
                    }
                }
            }
            Button(onClick = onRetry, modifier = Modifier.fillMaxWidth()) { Text("Retry") }
        }
    }

    @Composable
    private fun BrowserScreen() {
        val web = remember { createWebView().also { it.loadUrl(HOME) } }
        var menu by remember { mutableStateOf(false) }
        val snack = remember { SnackbarHostState() }
        val msg = message.value

        LaunchedEffect(msg) {
            if (msg != null) {
                val res = snack.showSnackbar(
                    msg,
                    actionLabel = "Open Settings",
                    duration = SnackbarDuration.Long
                )
                if (res == SnackbarResult.ActionPerformed) openAppSettings()
                message.value = null
            }
        }

        BackHandler { if (web.canGoBack()) web.goBack() else finish() }

        Scaffold(
            snackbarHost = { SnackbarHost(snack) },
            bottomBar = {
                Surface(tonalElevation = 3.dp) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { if (web.canGoBack()) web.goBack() else finish() }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                        }
                        IconButton(onClick = { web.loadUrl(HOME) }) {
                            Icon(Icons.Filled.Home, "Home")
                        }
                        Box {
                            IconButton(onClick = { menu = true }) {
                                Icon(Icons.Filled.MoreVert, "Menu")
                            }
                            DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                                DropdownMenuItem(
                                    text = { Text("Refresh Page") },
                                    onClick = { menu = false; web.reload() }
                                )
                                DropdownMenuItem(
                                    text = { Text("Clear Session") },
                                    onClick = { menu = false; clearSession(web) }
                                )
                                DropdownMenuItem(
                                    text = { Text("Exit Application") },
                                    onClick = { menu = false; finishAffinity() }
                                )
                            }
                        }
                    }
                }
            }
        ) { pad ->
            AndroidView(
                modifier = Modifier
                    .padding(pad)
                    .fillMaxSize(),
                factory = { web }
            )
        }
    }

    private fun clearSession(web: WebView) {
        CookieManager.getInstance().removeAllCookies(null)
        CookieManager.getInstance().flush()
        WebStorage.getInstance().deleteAllData()
        web.clearCache(true)
        web.clearHistory()
        web.loadUrl(HOME)
    }

    // ---------- WebView ----------
    @SuppressLint("SetJavaScriptEnabled")
    @Suppress("DEPRECATION")
    private fun createWebView(): WebView = WebView(this).apply {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            cacheMode = WebSettings.LOAD_NO_CACHE
            saveFormData = false
            savePassword = false
            allowFileAccess = false
            allowContentAccess = false
        }
        webViewClient = object : WebViewClient() {
            override fun onReceivedSslError(
                view: WebView?, handler: SslErrorHandler?, error: SslError?
            ) {
                handler?.cancel()
            }
        }
        webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?, callback: GeolocationPermissions.Callback?
            ) {
                if (locationOk()) {
                    callback?.invoke(origin, true, false)
                } else {
                    callback?.invoke(origin, false, false)
                    message.value = "Location permission is off. Enable it from App Settings."
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                if (filePathCallback == null || fileChooserParams == null) return false
                if (!storageOk()) {
                    filePathCallback.onReceiveValue(null)
                    message.value = "Storage permission is off. Enable it from App Settings."
                    return true
                }
                fileCallback?.onReceiveValue(null)
                fileCallback = filePathCallback
                return try {
                    chooser.launch(fileChooserParams.createIntent())
                    true
                } catch (e: Exception) {
                    fileCallback = null
                    filePathCallback.onReceiveValue(null)
                    true
                }
            }
        }
    }
}
