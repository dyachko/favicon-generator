<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = $_POST['image'];
    list($type, $data) = explode(';', $data);
    list(, $data)      = explode(',', $data);
    $data = base64_decode($data);
    $image = imagecreatefromstring($data);

    if ($image !== false) {
        $sizes = [16, 32, 48, 64, 128, 256];
        $dir = sys_get_temp_dir() . '/favicons_' . uniqid();
        mkdir($dir);

        foreach ($sizes as $size) {
            $resized = imagescale($image, $size, $size);
            imagepng($resized, "$dir/favicon-$size.png");
            imagedestroy($resized);
        }

        imagedestroy($image);

        $zip = new ZipArchive();
        $zipFile = tempnam(sys_get_temp_dir(), 'zip');
        if ($zip->open($zipFile, ZipArchive::CREATE) === TRUE) {
            foreach ($sizes as $size) {
                $zip->addFile("$dir/favicon-$size.png", "favicon-$size.png");
            }
            $zip->close();

            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="favicon.zip"');
            readfile($zipFile);

            unlink($zipFile);
            array_map('unlink', glob("$dir/*.*"));
            rmdir($dir);
        } else {
            echo 'Ошибка при создании архива.';
        }
    } else {
        echo 'Ошибка при обработке изображения.';
    }
} else {
    echo 'Неверный метод запроса.';
}
