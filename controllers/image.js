
const PAT = 'd55512437b5d462dba142d169c9d4c05';

const USER_ID = 'clarifai';
const APP_ID = 'main';

const MODEL_ID = 'face-sentiment-recognition';
const MODEL_VERSION_ID = 'a5d7776f0c064a41b48c3ce039049f65';

import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key d55512437b5d462dba142d169c9d4c05");

// const Clarifai = require('clarifai');

// const app = new Clarifai.App({
//   apiKey: 'd55512437b5d462dba142d169c9d4c05'
//  });
const handleApiCall = (req, res) => {
  stub.PostModelOutputs(
    {
      user_app_id: {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      model_id: MODEL_ID,
      version_id: MODEL_VERSION_ID, // This is optional. Defaults to the latest model version
      inputs: [
          { data: { image: { url: req.body.input } } }
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

      // Since we have one input, one output will exist here
      

      console.log("Predicted concepts:");
      for (const c of response.outputs[0].data.concepts) {
          console.log(c.name + " " + concept.value);
      }
        res.json(response)
      }
  )
}
  // app.models.predict('face-detection', req.body.input)
  //   .then(data => {
  //     res.json(data);
  //   })
  //   .catch(err => res.status(400).json('unable to work with API'))

const handleImage = (req, res, db)  => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
      // entries[0] --> this used to return the entries
      // TO
      // entries[0].entries --> this now returns the entries
      res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'))
  }

export default {
    handleImage,
    handleApiCall
}