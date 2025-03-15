let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let isRecording = false; // **لمنع التسجيل المكرر**



document.getElementById('start-recording').addEventListener('click', async () => {

    if (isRecording) return; // **يمنع بدء تسجيل جديد أثناء التسجيل الحالي**

    isRecording = true;

    audioChunks = []; // **إعادة تعيين قائمة الصوتيات لتجنب التكرار**



    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });



        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mp4' }); // ✅ **أفضل دعم للـ iPhone**

        mediaRecorder.start();

        

        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



        mediaRecorder.ondataavailable = event => {

            if (event.data.size > 0) {

                audioChunks.push(event.data);

            }

        };



        mediaRecorder.onstop = () => {

            if (audioChunks.length === 0) { 

                alert("⚠️ فشل التسجيل، الرجاء المحاولة مرة أخرى."); 

                return;

            }



            audioBlob = new Blob(audioChunks, { type: 'audio/mp4' }); // ✅ **دعم تشغيل الصوت في iPhone**

            audioUrl = URL.createObjectURL(audioBlob);

            

            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';



            const previewAudio = document.getElementById('preview-audio');

            previewAudio.src = audioUrl;

            previewAudio.style.display = 'block';



            isRecording = false;

        };



    } catch (error) {

        console.error("❌ خطأ أثناء تشغيل الميكروفون:", error);

        alert("⚠️ تأكد من السماح باستخدام الميكروفون في إعدادات الهاتف.");

        isRecording = false;

    }

});



document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder && isRecording) {

        mediaRecorder.stop();

    }

    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});

