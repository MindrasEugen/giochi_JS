package it.giochijs.app;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

// Attività principale di «Giochi di una volta» (Tappa 29, ADR 0013).
// - Schermo intero: barra di stato e barra di navigazione nascoste; scorrendo dal bordo riappaiono per poco.
// - Tasto indietro: decide la pagina con window.indietroApp() (js/indietro.js). Se la pagina non lo usa
//   (per esempio nella home), l'app va in secondo piano come fanno le app di sistema.
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        nascondiBarre();
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() == null || getBridge().getWebView() == null) {
                    moveTaskToBack(true);
                    return;
                }
                getBridge().getWebView().evaluateJavascript(
                    "typeof window.indietroApp === 'function' && window.indietroApp() === true",
                    risultato -> {
                        if (!"true".equals(risultato)) moveTaskToBack(true);
                    }
                );
            }
        });
    }

    // Le barre riappaiono dopo un dialogo di sistema o al ritorno nell'app: si nascondono di nuovo
    @Override
    public void onWindowFocusChanged(boolean conFuoco) {
        super.onWindowFocusChanged(conFuoco);
        if (conFuoco) nascondiBarre();
    }

    private void nascondiBarre() {
        WindowInsetsControllerCompat controllo = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controllo.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controllo.hide(WindowInsetsCompat.Type.systemBars());
    }
}
