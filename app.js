
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const editor = document.getElementById('editor');
    const canvas = document.getElementById('canvas');
    const confirmBtn = document.getElementById('confirm-btn');
    const downloadBtn = document.getElementById('download-btn');
    let cropper;

    uploadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        cropper = new Cropper(canvas, {
                            aspectRatio: 1,
                        });
                        editor.style.display = 'flex';
                    };
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    confirmBtn.addEventListener('click', () => {
        const croppedCanvas = cropper.getCroppedCanvas();
        canvas.width = croppedCanvas.width;
        canvas.height = croppedCanvas.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(croppedCanvas, 0, 0);
        cropper.destroy();
        downloadBtn.style.display = 'block';
    });

    downloadBtn.addEventListener('click', () => {
        const imageData = canvas.toDataURL();
        const formData = new FormData();
        formData.append('image', imageData);

        fetch('server/generate-archive.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'favicon.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    });
});
