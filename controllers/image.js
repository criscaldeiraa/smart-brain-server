import {formatError} from '../utils/formatError.js';
import dotenv from 'dotenv';
dotenv.config();
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";

const PAT = process.env.API_CLARIFAI;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-sentiment-recognition';

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key" + PAT);

const handleApiCall = (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json(formatError("please provide image url"));
  }
  stub.PostModelOutputs(
    {
      user_app_id: {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      model_id: MODEL_ID,
      inputs: [
          { data: { image: { url: req.body.input, allow_duplicate_url: true } } }
      ]
  },
  metadata,
  (err, response) => {
      if (err) {
        console.log(err);
        res.status(400).json(formatError("something is wrong"));
      }

      if (response.status.code !== 10000) {
        console.log(response.status.description);
        res.status(400).json(formatError("something is wrong"));
      }
      // console.log("Predicted concepts:");
      // for (const c of response.outputs[0].data.concepts) {
      //     console.log(c.name + " " + concept.value);
      // }
        res.json(response)
      }
  )
};

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