import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { setupDirectories, downloadRawVideo, uploadProcessedVideo, convertVideo, deleteRawVideo, deleteProcessedVideo } from './storage';

setupDirectories();


const app = express();
app.use(express.json()); // for parsing application/json


app.post('/process-video', async (req, res) => {
	// get the bucket and the filename from the cloud pub/sub message
	let data
	try {
		const message = Buffer.from(req.body.message.data, 'base64').toString('utf8').trim();
		data = JSON.parse(message);
		if (!data.name) {
			throw new Error('Invalid message payload recieved')
		}
	} catch (error) {
		console.log(error)
		return res.status(400).send('Bad Request: missing filename')
	}

	const inputFileName = data.name;
	const outputFileName = `processed-${inputFileName}`

	// download the video from the raw videos bucket
	await downloadRawVideo(inputFileName)

	try {
		// convert the video to 360p
		await convertVideo(inputFileName, outputFileName)
	} catch (error) {
		// if the video processing fails, delete the raw and processed videos
		await Promise.all([
			deleteRawVideo(inputFileName),
			deleteProcessedVideo(outputFileName)
		])
		// log error
		console.log(error)
		return res.status(500).send('Internal Server Error: video processing failed')
	}

	// upload the processed video to the processed videos bucket
	await uploadProcessedVideo(outputFileName)

	// delete the raw and processed videos after successful processing
	await Promise.all([
		deleteRawVideo(inputFileName),
		deleteProcessedVideo(outputFileName)
	])

	// return a success response
	return res.status(200).send('Processing complete')

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Video Processing Service at http://localhost:${port}`);
});
