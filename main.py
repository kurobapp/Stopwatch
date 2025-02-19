#main.py
import sys
from pathlib import Path
from PySide6.QtWidgets import QApplication
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWebChannel import QWebChannel
from PySide6.QtCore import QObject, Slot

class Bridge(QObject):
    @Slot(str)
    def logMessage(self, message):
        print(f"JavaScript: {message}")

    @Slot()
    def timerFinished(self):
        print("タイマー終了！")

app = QApplication(sys.argv)

webview = QWebEngineView()
channel = QWebChannel()

bridge = Bridge()
channel.registerObject("bridge", bridge)

webview.page().setWebChannel(channel)

html_file = Path("web/index.html").resolve().as_uri()
webview.setUrl(html_file)

webview.show()
sys.exit(app.exec())
