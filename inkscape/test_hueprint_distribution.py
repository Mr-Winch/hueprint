import hashlib
from pathlib import Path
import unittest
import zipfile


class HuePrintDistributionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inkscape = Path(__file__).resolve().parent
        cls.repository = cls.inkscape.parent
        cls.download = cls.inkscape / "download"
        cls.version = (cls.inkscape / "VERSION").read_text(encoding="utf-8").strip()

    def test_every_release_package_is_versioned_and_self_service(self):
        package_names = (
            f"HuePrint-Inkscape-{self.version}.zip",
            f"HuePrint-Windows-{self.version}.zip",
            f"HuePrint-{self.version}-Inkscape-Gallery.zip",
        )
        required = {
            "Install HuePrint.cmd",
            "Uninstall HuePrint.cmd",
            "install.ps1",
            "uninstall.ps1",
            "hueprint_color_names.py",
            "hueprint_ntc.js",
        }
        for package_name in package_names:
            with self.subTest(package=package_name):
                package = self.download / package_name
                self.assertTrue(package.is_file())
                with zipfile.ZipFile(package) as archive:
                    self.assertTrue(required.issubset(set(archive.namelist())))

    def test_unversioned_package_aliases_are_not_published(self):
        self.assertFalse((self.download / "HuePrint-Inkscape.zip").exists())
        self.assertFalse((self.download / "HuePrint-Windows.zip").exists())

    def test_gallery_checksum_matches_package(self):
        package = self.download / f"HuePrint-{self.version}-Inkscape-Gallery.zip"
        checksum = package.with_suffix(package.suffix + ".md5")
        expected = checksum.read_text(encoding="ascii").split()[0]
        self.assertEqual(hashlib.md5(package.read_bytes()).hexdigest(), expected)

    def test_release_sha256_checksums_match_packages(self):
        package_names = (
            f"HuePrint-Inkscape-{self.version}.zip",
            f"HuePrint-Windows-{self.version}.zip",
            f"HuePrint-{self.version}-Inkscape-Gallery.zip",
        )
        for package_name in package_names:
            with self.subTest(package=package_name):
                package = self.download / package_name
                checksum = package.with_suffix(package.suffix + ".sha256")
                expected = checksum.read_text(encoding="ascii").split()[0]
                self.assertEqual(hashlib.sha256(package.read_bytes()).hexdigest(), expected)

    def test_package_builder_enforces_semantic_versioned_names(self):
        source = (self.inkscape / "build_packages.ps1").read_text(encoding="utf-8")
        self.assertIn('HuePrint-Inkscape-$Version.zip', source)
        self.assertIn('HuePrint-Windows-$Version.zip', source)
        self.assertIn('HuePrint-$Version-Inkscape-Gallery.zip', source)
        self.assertIn("semantic versioning", source)
        self.assertIn("Version mismatch", source)
        self.assertIn('Join-Path $InkscapeRoot "VERSION"', source)


if __name__ == "__main__":
    unittest.main()
