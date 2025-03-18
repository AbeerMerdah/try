let mediaRecorder;

let audioChunks = [];

let audioBlob;

let recordedAudio;

let imageFile = null;



// ⏺️ بدء التسجيل

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);

        audioChunks = [];



        mediaRecorder.start();

        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        mediaRecorder.ondataavailable = event => {

            audioChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            const audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';

            audioElement.controls = true;



            recordedAudio = new Audio(audioUrl);

            document.getElementById('save-to-camera-roll').disabled = false; // تمكين زر الحفظ

        };

    } catch (error) {

        alert("❌ يرجى السماح بالوصول إلى الميكروفون من إعدادات الجهاز.");

    }

});



// ⏹️ إيقاف التسجيل

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stop();

    }

    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



// 📷 تحميل الصورة

document.getElementById('image-upload').addEventListener('change', event => {

    const file = event.target.files[0];

    if (!file) return;

    

    const reader = new FileReader();

    reader.onload = function(e) {

        document.getElementById('preview-image').src = e.target.result;

        document.getElementById('preview-image').style.display = 'block';

        imageFile = file;

    };

    reader.readAsDataURL(file);

});



// 🎥 حفظ الفيديو مع الصوت

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !imageFile) {

        alert("❌ يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    const image = new Image();



    image.src = URL.createObjectURL(imageFile);

    image.onload = async () => {

        canvas.width = image.width;

        canvas.height = image.height;

        context.drawImage(image, 0, 0);



        // تحويل الـ canvas إلى فيديو

        const stream = canvas.captureStream(30);

        const videoRecorder = new MediaRecorder(stream);

        let videoChunks = [];



        videoRecorder.ondataavailable = event => {

            videoChunks.push(event.data);

        };



        videoRecorder.onstop = async () => {

            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });



            // دمج الصوت مع الفيديو

            const finalVideoBlob = await mergeAudioWithVideo(videoBlob, audioBlob);

            const finalVideoUrl = URL.createObjectURL(finalVideoBlob);



            // تحميل الفيديو

            const a = document.createElement('a');

            a.href = finalVideoUrl;

            a.download = 'eid_greeting_card.mp4';

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            alert("🎉 تم حفظ الفيديو مع الصوت بنجاح!");

        };



        videoRecorder.start();

        recordedAudio.play();



        recordedAudio.onended = () => {

            videoRecorder.stop();

        };

    };

});



// 🛠️ دمج الصوت مع الفيديو

async function mergeAudioWithVideo(videoBlob, audioBlob) {

    const audioContext = new AudioContext();

    const audioBuffer = await audioBlob.arrayBuffer();

    const videoBuffer = await videoBlob.arrayBuffer();



    return new Blob([videoBuffer, audioBuffer], { type: 'video/mp4' });

}

