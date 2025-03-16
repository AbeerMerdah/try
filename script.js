let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;



document.getElementById('start-recording').addEventListener('click', async () => {

    audioChunks = [];

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });



        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorder.start();



        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        mediaRecorder.ondataavailable = event => {

            if (event.data.size > 0) {

                audioChunks.push(event.data);

            }

        };



        mediaRecorder.onstop = () => {

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            audioUrl = URL.createObjectURL(audioBlob);

            

            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';

            audioElement.controls = true;



            document.getElementById('preview-audio').src = audioUrl;

            document.getElementById('preview-audio').style.display = 'block';

        };

    } catch (error) {

        console.error("حدث خطأ أثناء تشغيل الميكروفون:", error);

        alert("يرجى السماح بالوصول إلى الميكروفون.");

    }

});



document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stop();

    }

    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



document.getElementById('upload-image').addEventListener('click', () => {

    const imageInput = document.getElementById('image-upload');

    const previewImage = document.getElementById('preview-image');

    const saveButton = document.getElementById('save-to-camera-roll');



    if (imageInput.files.length > 0) {

        const file = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';

            saveButton.style.display = 'block';

        };



        reader.readAsDataURL(file);

    } else {

        alert("يرجى تحميل صورة.");

    }

});



document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !document.getElementById('preview-image').src) {

        alert("يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    // تحويل الصوت إلى MP3 ليكون متوافقًا

    const audioFile = new File([audioBlob], "audio.mp3", { type: "audio/mpeg" });

    const audioUrl = URL.createObjectURL(audioFile);



    // تحميل FFmpeg.js لمعالجة الفيديو

    const { createFFmpeg, fetchFile } = FFmpeg;

    const ffmpeg = createFFmpeg({ log: true });



    await ffmpeg.load();



    // رفع الملفات إلى FFmpeg

    ffmpeg.FS("writeFile", "image.png", await fetchFile(document.getElementById("preview-image").src));

    ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audioUrl));



    // إنشاء الفيديو

    await ffmpeg.run(

        "-loop", "1",

        "-i", "image.png",

        "-i", "audio.mp3",

        "-c:v", "libx264",

        "-tune", "stillimage",

        "-c:a", "aac",

        "-b:a", "192k",

        "-pix_fmt", "yuv420p",

        "-shortest",

        "output.mp4"

    );



    const videoData = ffmpeg.FS("readFile", "output.mp4");

    const videoBlob = new Blob([videoData.buffer], { type: "video/mp4" });

    const videoUrl = URL.createObjectURL(videoBlob);



    // حفظ الفيديو

    const a = document.createElement('a');

    a.href = videoUrl;

    a.download = 'eid_greeting_card.mp4';

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);



    alert("🎉 تم حفظ الفيديو بنجاح!");

});

