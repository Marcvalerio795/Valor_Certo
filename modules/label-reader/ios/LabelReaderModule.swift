import ExpoModulesCore
import Vision
import UIKit
import ImageIO

public class LabelReaderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LabelReader")
    AsyncFunction("recognize") { (uri: String) -> String in
      guard let url = URL(string: uri), url.isFileURL,
            let image = UIImage(contentsOfFile: url.path), let cgImage = image.cgImage else {
        throw NSError(domain: "LabelReader", code: 1, userInfo: [NSLocalizedDescriptionKey: "Não foi possível abrir a foto."])
      }
      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.recognitionLanguages = ["pt-BR", "en-US"]
      request.usesLanguageCorrection = true
      let orientation: CGImagePropertyOrientation
      switch image.imageOrientation {
      case .up: orientation = .up
      case .down: orientation = .down
      case .left: orientation = .left
      case .right: orientation = .right
      case .upMirrored: orientation = .upMirrored
      case .downMirrored: orientation = .downMirrored
      case .leftMirrored: orientation = .leftMirrored
      case .rightMirrored: orientation = .rightMirrored
      @unknown default: orientation = .up
      }
      try VNImageRequestHandler(cgImage: cgImage, orientation: orientation).perform([request])
      return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
    }
  }
}
