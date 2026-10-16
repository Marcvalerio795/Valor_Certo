Pod::Spec.new do |s|
  s.name = 'LabelReader'
  s.version = '1.0.0'
  s.summary = 'On-device label text recognition'
  s.description = s.summary
  s.license = { :type => 'MIT' }
  s.author = 'Valor Certo'
  s.homepage = 'https://github.com/Marcvalerio795/Valor_Certo'
  s.source = { :git => 'https://github.com/Marcvalerio795/Valor_Certo.git' }
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'Vision', 'UIKit'
  s.source_files = '**/*.swift'
end
