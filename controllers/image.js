import {formatError} from '../utils/formatError.js';
import dotenv from 'dotenv';
dotenv.config();
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";
import Clarifai from 'clarifai';

const clarifai = new Clarifai.App({
  apiKey: process.env.API_CLARIFAI,
});
const PAT = process.env.API_CLARIFAI;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + PAT);

const handleApiCall = (req, res) => {
  const { input } = req.body.imageUrl;
  const { imageUrl } = req.body;
  stub.PostModelOutputs(
    {
        user_app_id: {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        model_id: MODEL_ID,
        version_id: MODEL_VERSION_ID, // This is optional. Defaults to the latest model version
        inputs: [
            {
                data: {
                    image: {
                        url: IMAGE_URL,
                        // base64: imageBytes,
                        allow_duplicate_url: true
                    }
                }
            }
        ]
    },
    metadata,
    (err, response) => {
        if (err) {
            throw new Error(err);
        }

        if (response.status.code !== 10000) {
            throw new Error("Post model outputs failed, status: " + response.status.description);
        }

        const regions = response.outputs[0].data.regions;
        const boundingBox = region.region_info.bounding_box;
        regions.forEach(region => {
            // Accessing and rounding the bounding box values
            const topRow = boundingBox.top_row.toFixed(3);
            const leftCol = boundingBox.left_col.toFixed(3);
            const bottomRow = boundingBox.bottom_row.toFixed(3);
            const rightCol = boundingBox.right_col.toFixed(3);

            region.data.concepts.forEach(concept => {
                // Accessing and rounding the concept value
                const name = concept.name;
                const value = concept.value.toFixed(4);

                console.log(`${name}: ${value} BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`);

            })
          })
      })
      .catch(err => res.status(400).json('unable to work with API'));
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