import sys
sys.path.append('/data/scratch/fxwang/harm/AccoMontage2')
import chorderator as cdt

import tensorflow as tf
physical_devices = tf.config.list_physical_devices('GPU')
tf.config.set_visible_devices(physical_devices[1:], 'GPU')
logical_devices = tf.config.list_logical_devices('GPU')
print(logical_devices)

from flask import Flask, render_template, request
import flask
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
import os
from datetime import datetime
from flask_cors import CORS
from flask import send_file
from flask import jsonify
import music21

app = Flask(__name__)
CORS(app)

cdt.set_segmentation('A8')
cdt.set_texture_prefilter((0, 2))
cdt.set_note_shift(0)
cdt.set_output_style(cdt.Style.POP_STANDARD)

@app.route("/receive", methods=['post'])
def form():
    files = request.files
    file = files.get('file')
    print(file) # file is the mp3 praying

    # datetime object containing current date and time
    now = datetime.now()

    # dd/mm/YY H:M:S
    filename = now.strftime("%d_%m_%Y-%H_%M_%S")

    file.save(os.path.abspath(f'audio_files/{filename}.mp3'))
    midi = predict(f'audio_files/{filename}.mp3')[1]
    midi.write(f"midi_files/{filename}.mid")
    
    score = music21.converter.parse(f"midi_files/{filename}.mid")
    key = score.analyze('key')

    cdt.set_melody(f"midi_files/{filename}.mid")
    cdt.set_meta(tonic=key.tonic.name)
    cdt.generate_save(f"midi_files/{filename}_result")
    
    response = jsonify(f"midi_files/{filename}_result/textured_chord_gen.mid")
    response.headers.add('Access-Control-Allow-Origin', '*')
    
    return response

if __name__ == "__main__":
    app.run(debug=True, port=8889, host="0.0.0.0")