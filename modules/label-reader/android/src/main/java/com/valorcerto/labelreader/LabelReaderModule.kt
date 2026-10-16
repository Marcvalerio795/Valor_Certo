package com.valorcerto.labelreader

import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LabelReaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LabelReader")
    AsyncFunction("recognize") { uri: String, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("NO_CONTEXT", "O aplicativo não está disponível.", null)
      } else {
        try {
          val image = InputImage.fromFilePath(context, Uri.parse(uri))
          val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
          recognizer.process(image)
            .addOnSuccessListener { result -> promise.resolve(result.text) }
            .addOnFailureListener { error -> promise.reject("OCR_FAILED", "Não foi possível ler a etiqueta.", error) }
            .addOnCompleteListener { recognizer.close() }
        } catch (error: Exception) {
          promise.reject("IMAGE_FAILED", "Não foi possível abrir a foto.", error)
        }
      }
    }
  }
}
