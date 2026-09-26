package in.co.spiritual.app;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private int canvasColor = Color.rgb(245, 241, 232);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AlphaCanvasPlugin.class);
        super.onCreate(savedInstanceState);
        applyCanvasColor();
    }

    void setCanvasColor(int color) {
        canvasColor = color;
        applyCanvasColor();
    }

    private void applyCanvasColor() {
        View decor = getWindow().getDecorView();
        decor.setBackgroundColor(canvasColor);
        boolean lightCanvas = canvasColor == Color.rgb(245, 241, 232);
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), decor);
        bars.setAppearanceLightStatusBars(lightCanvas);
        bars.setAppearanceLightNavigationBars(lightCanvas);
    }

    @Override
    public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        getWindow().getDecorView().post(this::applyCanvasColor);
    }

    @Override
    public void onResume() {
        super.onResume();
        getWindow().getDecorView().post(this::applyCanvasColor);
    }
}
