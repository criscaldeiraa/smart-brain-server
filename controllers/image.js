import {formatError} from '../utils/formatError.js';
import dotenv from 'dotenv';
dotenv.config();
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";
import Clarifai from 'clarifai';

const clarifai = new Clarifai.App({
  apiKey: process.env.API_CLARIFAI,
});
// const PAT = process.env.API_CLARIFAI;
// const USER_ID = 'clarifai';
// const APP_ID = 'main';
// const MODEL_ID = 'face-detection';
// const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
// const IMAGE_URL = 'req.body.imageUrl';

const handleApiCall = async (req, res) => {
  const { input } = req.body.imageUrl;
  // if (!input) {
  //   return res.status(400).json(formatError("please provide image url"));
  // }
  try {
    const { imageUrl } = req.body;

    const response = await clarifai.models.predict(
      'c0c0ac362b03416da06ab3fa36fb58e3', // Clarifai's general model for face detection
      { inputs: [{ data: { image: { url: imageUrl } } }] }
    );

    res.json(response);
  } catch (error) {
    console.error('Clarifai Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


const handleImage = async (req, res, db)  => {
  const { id } = req.body;
  const userEntries = await db
    .table("users")
    .where({ id: id })
    .increment({ entries: 1 })
    .returning("entries");

  if (userEntries.length) {
    res.json(userEntries[0].entries);
  } else {
    res.status(404).json(formatError("user not found"));
  }
};

export { handleImage, handleApiCall };