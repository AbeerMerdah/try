const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({ log: true, corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js' });



let mediaRecorder;

let audioBlob;

let audioUrl;

let imageFile;



document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new RecordRTC(stream, {

            type: 'audio',

            mimeType: 'audio/webm',

        });

        mediaRecorder.startRecording();



        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        console.log("بدأ التسجيل بنجاح!");

    } catch (error) {

        console.error("حدث خطأ أثناء تشغيل الميكروفون:", error);

        alert("يرجى السماح بالوصول إلى الميكروفون.");

    }

});



document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stopRecording(() => {

            audioBlob = mediaRecorder.getBlob();

            audioUrl = URL.createObjectURL(audioBlob);

            document.getElementById('audio').src = audioUrl;

            document.getElementById('audio').style.display = 'block';

            document.getElementById('preview-audio').src = audioUrl;

            document.getElementById('preview-audio').style.display = 'block';



            console.log("تم إيقاف التسجيل بنجاح!");

        });



        document.getElementById('start-recording').disabled = false;

        document.getElementById('stop-recording').disabled = true;

    }

});



document.getElementById('upload-image').addEventListener('click', () => {

    const imageInput = document.getElementById('image-upload');

    const previewImage = document.getElementById('preview-image');

    const saveButton = document.getElementById('save-to-camera-roll');



    if (imageInput.files.length > 0) {

        imageFile = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';

            saveButton.style.display = 'block';

        };



        reader.readAsDataURL(imageFile);

    } else {

        alert("يرجى تحميل صورة.");

    }

});



document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !imageFile) {

        alert("يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    try {

        if (!ffmpeg.isLoaded()) {

            await ffmpeg.load();

        }



        const imageUrl = URL.createObjectURL(imageFile);

        const audioUrl = URL.createObjectURL(audioBlob);



        // تحميل الصورة والصوت إلى ffmpeg

        ffmpeg.FS('writeFile', 'image.png', await fetchFile(imageUrl));

        ffmpeg.FS('writeFile', 'audio.webm', await fetchFile(audioUrl));



        // دمج الصوت مع الصورة باستخدام ffmpeg

        await ffmpeg.run(

            '-loop', '1',

            '-i', 'image.png',

            '-i', 'audio.webm',

            '-c:v', 'libx264',

            '-t', '30', // مدة الفيديو (30 ثانية)

            '-pix_fmt', 'yuv420p',

            '-vf', 'scale=640:480', // حجم الفيديو

            '-shortest',

            'output.mp4'

        );



        // قراءة الفيديو الناتج

        const data = ffmpeg.FS('readFile', 'output.mp4');

        const videoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));



        // عرض الفيديو

        const previewVideo = document.getElementById('preview-video');

        previewVideo.src = videoUrl;

        previewVideo.style.display = 'block';



        // زر التنزيل

        const downloadButton = document.createElement('button');

        downloadButton.textContent = 'تنزيل الفيديو';

        downloadButton.style.marginTop = '10px';

        downloadButton.onclick = () => {

            const a = document.createElement('a');

            a.href = videoUrl;

            a.download = 'eid_greeting_card.mp4';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

        };

        document.querySelector('.preview-section').appendChild(downloadButton);



        alert("تم إنشاء الفيديو بنجاح!");

    } catch (error) {

        console.error("حدث خطأ أثناء إنشاء الفيديو:", error);

        alert("حدث خطأ أثناء إنشاء الفيديو. يرجى المحاولة مرة أخرى.");

    }

});



