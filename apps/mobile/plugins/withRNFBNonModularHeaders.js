const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin that patches the Podfile to allow non-modular header includes
 * in React Native Firebase targets. This fixes the iOS build error:
 * "include of non-modular header inside framework module 'RNFBApp.XXX'"
 *
 * See: https://github.com/expo/expo/issues/39607
 */
module.exports = function withRNFBNonModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      const postInstallPatch = `
    # Fix React Native Firebase non-modular header errors
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |config|
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    end`;

      if (podfile.includes('post_install do |installer|')) {
        podfile = podfile.replace(
          'post_install do |installer|',
          `post_install do |installer|${postInstallPatch}`,
        );
      } else {
        const lastEndIndex = podfile.lastIndexOf('end');
        podfile =
          podfile.slice(0, lastEndIndex) +
          `  post_install do |installer|${postInstallPatch}\n  end\n` +
          podfile.slice(lastEndIndex);
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};
