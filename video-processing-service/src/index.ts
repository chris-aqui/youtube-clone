import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();


app.post('/process-video', (req, res) => {
	// get path of the input video file from the request body
	const inputVideoPath = req.body.inputVideoPath;
	const outputVideoPath = req.body.outputVideoPath;

	if (!inputVideoPath || !outputVideoPath) {
		res.status(400).send('Invalid input');
		return;
	}

	// ffmpeg async processing
	ffmpeg(inputVideoPath)
		.outputOptions('-vf', 'scale=-1:360') // 360p resolution
		.on('end', () => {
			console.log('Video processing finished !');
			res.status(200).send('Video processing finished !');
		})
		.on('error', (err) => {
			console.log('Error while processing video', err);
			res.status(500).send(`Error while processing video - ${err.message}`);
		})
		.save(outputVideoPath);
	// 
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Video Processing Service at http://localhost:${port}`);
});
