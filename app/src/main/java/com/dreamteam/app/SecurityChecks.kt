package com.dreamteam.app

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.Build
import android.provider.Settings
import java.io.File
import java.net.NetworkInterface

data class CheckResult(val name: String, val failed: Boolean)

object SecurityChecks {

    fun runAll(ctx: Context): List<CheckResult> = listOf(
        CheckResult("Developer Options", developerOptions(ctx)),
        CheckResult("Wi-Fi Hotspot", hotspot(ctx)),
        CheckResult("Wi-Fi Connection", transport(ctx, NetworkCapabilities.TRANSPORT_WIFI)),
        CheckResult("VPN", transport(ctx, NetworkCapabilities.TRANSPORT_VPN)),
        CheckResult("Root", rooted())
    )

    private fun developerOptions(ctx: Context): Boolean = try {
        Settings.Global.getInt(
            ctx.contentResolver,
            Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0
        ) == 1
    } catch (e: Exception) {
        false
    }

    private fun hotspot(ctx: Context): Boolean {
        try {
            val wm = ctx.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val m = wm.javaClass.getDeclaredMethod("isWifiApEnabled")
            m.isAccessible = true
            if (m.invoke(wm) as? Boolean == true) return true
        } catch (e: Exception) {
        }
        try {
            val list = NetworkInterface.getNetworkInterfaces() ?: return false
            for (i in list) {
                val n = i.name.lowercase()
                val apLike = n.startsWith("ap") || n.startsWith("softap") || n == "wlan1"
                if (apLike && i.isUp && i.inetAddresses.hasMoreElements()) return true
            }
        } catch (e: Exception) {
        }
        return false
    }

    @Suppress("DEPRECATION")
    private fun transport(ctx: Context, type: Int): Boolean = try {
        val cm = ctx.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        cm.allNetworks.any { n ->
            cm.getNetworkCapabilities(n)?.hasTransport(type) == true
        }
    } catch (e: Exception) {
        false
    }

    private fun rooted(): Boolean {
        if (Build.TAGS?.contains("test-keys") == true) return true
        val paths = listOf(
            "/system/bin/su", "/system/xbin/su", "/sbin/su", "/data/local/su",
            "/data/local/bin/su", "/data/local/xbin/su", "/system/sd/xbin/su",
            "/system/bin/failsafe/su", "/su/bin/su", "/system/app/Superuser.apk"
        )
        return paths.any { File(it).exists() }
    }
}
