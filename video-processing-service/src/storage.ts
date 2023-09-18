import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import Ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideosBucketName = 'caqui-yt-raw-videos'; // goblally uniq name
const processedVideosBucketName = 'caqui-yt-processed-videos'; // goblally uniq name

const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = './processed-videos';


/**
Create the lcoal directory for raw and processed videos
*/
export function setupDirectories() {
	ensureDirectoryExists(localRawVideoPath);
	ensureDirectoryExists(localProcessedVideoPath);

}

/** 
* @param rawVideoName - the name of the raw video file from {@linklocalRawVideoPath}
* @param processedVideoName - the name of the processed video file from {@linklocalProcessedVideoPath}
* @returns a promise that resolves when the video has been comverted. 
*/
export function convertVideo(
	rawVideoName: string,
	processedVideoName: string
): Promise<void> {
	return new Promise((resolve, reject) => {
		const ffmpeg = Ffmpeg(`${localRawVideoPath}/${rawVideoName}`);

		ffmpeg
			.outputOptions('-vf', 'scale=-1:360') // 360p resolution
			.on('end', () => {
				console.log('Video processing finished !');
				resolve();
			})
			.on('error', (err, stdout, stderr) => {
				console.log('Error while processing video', err);
				console.log('ffmpeg stdout:', stdout);
				console.log('ffmpeg stderr:', stderr);
				reject(err);
			})
			.save(`${localProcessedVideoPath}/${processedVideoName}`);
	});
}


/** 
 * @param fileName - the name of the file to upload from the {@link localProcessedVideoPath} folder 
 * into the {@link processedVideosBucketName} bucket
 * @returns a promise that resolves when the file has been uploaded
*/
export async function uploadProcessedVideo(fileName: string) {
	// async/await version
	const bucket = storage.bucket(processedVideosBucketName);


	// upload processed video
	await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
		destination: fileName,
	})
	console.log(`gs:://${processedVideosBucketName}/${fileName} uploaded to ${localProcessedVideoPath}/${fileName}`)

	// male processed video public
	await bucket.file(fileName).makePublic();

}

/** 
 * @param fileName - the name of the file to download from the {@link rawVideosBucketName} bucket 
 * into the {@link localRawVideoPath} folder
 * @returns a promise that resolves when the file has been downloaded
*/
export async function downloadRawVideo(fileName: string) {
	// async/await version
	await storage.bucket(rawVideosBucketName)
		.file(fileName)
		.download({ destination: `${localRawVideoPath}/${fileName}` })
		.catch((err) => {
			console.log('Error while downloading video', err);
			throw err;
		});

	console.log(`gs:://${rawVideosBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`)

	// Promise version
	// return new Promise((resolve, reject) => {
	// 	storage.bucket(rawVideosBucketName).file(fileName).download({
	// 		destination: `${localRawVideoPath}/${fileName}`,
	// 	}, (err) => {
	// 		if (err) {
	// 			console.log('Error while downloading video', err);
	// 			reject(err);
	// 			return;
	// 		}

	// 		console.log('Video downloaded successfully');
	// 		resolve();
	// 	});
	// });
}

/** 
 * @param filePath - the name of the file to delete
 * @returns a promise that resolves when the file has been deleted
*/
function deleteFile(filePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (fs.existsSync(filePath)) {
			// reject(new Error(`File ${filePath} does not exist`));
			fs.unlink(filePath, (err) => {
				if (err) {
					console.log(`Error while deleting file at ${filePath}`, err);
					reject(err);
				} else {
					console.log(`File at ${filePath} deleted successfully`);
					resolve();
				}
			});
		} else {
			console.log(`File not found at ${filePath}, skipping deletion`)
			resolve();
		}
	});
}

/**
 * @param fileName - the name of the file to delete from the {@link localRawVideoPath} folder
 * @returns a promise that resolves when the file has been deleted
 * @see deleteFile
 */
export function deleteRawVideo(fileName: string) {
	return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - the name of the file to delete from the {@link localProcessedVideoPath} folder
 * @returns a promise that resolves when the file has been deleted
 * @see deleteFile
 */
export function deleteProcessedVideo(fileName: string) {
	return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/** 
 * ensure a directory exists, if not create it
 * @param {string} directoryPath - the path of the directory to create
*/
function ensureDirectoryExists(directoryPath: string) {
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath, { recursive: true }); // recursive: true to create parent directories if they don't exist
		console.log(`Directory ${directoryPath} created`)
	}
}