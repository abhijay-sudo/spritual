package in.co.spiritual.app;

import android.graphics.Color;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Paint only the native inset canvas that surrounds Capacitor's WebView. */
@CapacitorPlugin(name = "AlphaCanvas")
public class AlphaCanvasPlugin extends Plugin {
    @PluginMethod
    public void setAppearance(PluginCall call) {
        String appearance = call.getString("appearance", "light");
        final int color;
        switch (appearance) {
            case "dusk": color = Color.rgb(33, 28, 32); break;
            case "night": color = Color.rgb(16, 25, 28); break;
            case "light": color = Color.rgb(245, 241, 232); break;
            default:
                call.reject("Unsupported appearance");
                return;
        }
        getBridge().executeOnMainThread(() -> {
            ((MainActivity) getActivity()).setCanvasColor(color);
            call.resolve();
        });
    }
}
