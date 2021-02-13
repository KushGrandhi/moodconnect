import nltk
from nltk.stem.lancaster import LancasterStemmer
stemmer = LancasterStemmer()
from  keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
import random
import json
import pickle
import pandas as pd
import numpy as np
import tensorflow as tf
import requests 
import time 

model = tf.keras.models.load_model('chatbot.h5')
mood_model = tf.keras.models.load_model('emotion_LSTM.h5')
data = pickle.load( open( "learning_chatbot.pkl", "rb" ) )
data_m = pickle.load(open('mood_learning.pkl','rb'))
X = data_m['train_x']
words = data['words']
classes = data['classes']
intents = json.loads(open('intents.json').read())
intents = intents["intents"]
tokenizer=Tokenizer(15212,lower=True,oov_token='UNK')
tokenizer.fit_on_texts(X)
def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [stemmer.stem(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words, show_details=True):
    sentence_words = clean_up_sentence(sentence)
    bag = [0]*len(words)  
    for s in sentence_words:
        for i,w in enumerate(words):
            if w == s: 
                bag[i] = 1
                if show_details:
                    pass

    return(np.array(bag))

def classify_flask(sentence):
    
    prob_threshold = 0.50
    input_data = pd.DataFrame([bow(sentence, words)], dtype=float, index=['input'])
    results = model.predict([input_data])[0]
    results = [[i,r] for i,r in enumerate(results) if r>prob_threshold]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    try:
        answer_class = return_list[0]
        answer_class = answer_class["intent"]
        for i in intents:
            if i['tag'] == answer_class:
                ans = i['responses']
                num = len(ans)
                answer_number = random.randrange(0,num)
                answer = ans[answer_number]
        response = answer
    except:
        response = "Can you rephrase and try?"
    return response

def news():
    url = 'https://newsapi.org/v2/top-headlines?country=in&apiKey=090129b20ca84810a0dfdce46f31d06e'
    try: 
        response = requests.get(url) 
    except: 
        print('error')
    news = json.loads(response.text)
    i=0
    fnews = ''
    for new in news['articles']: 
        i+=1
        fnews+="#####    News   ###### "+str(i) + ': ' 
        fnews+= str(new['title']) 
        fnews+=' -> url:     '
        fnews+=str(new['url']) + "              "
        if i>2:
            break
    return fnews
def get_key(value):
    dictionary={'joy':0,'anger':1,'love':2,'sadness':3,'fear':4,'surprise':5}
    for key,val in dictionary.items():
          if (val==value):
            return key

def mood(sentence):
    sentence_lst=[]
    sentence_lst.append(sentence)
    sentence_seq=tokenizer.texts_to_sequences(sentence_lst)
    sentence_padded=pad_sequences(sentence_seq,maxlen=80,padding='post')
    ans=get_key(mood_model.predict_classes(sentence_padded))
    return ans     
#def mood(sentence):
    #sent = clean_up_sentence(sentence)
    #return sent



app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return 'Hello World! im Lenny'

@app.route("/mood/<sentence>")
def mood_b(sentence):
    f_mood = (mood(sentence))
    return jsonify(present_mood = f_mood)

@app.route("/rbot/<sentence>")
def rbot(sentence):
    final = classify_flask(sentence)
    return jsonify(response = final)

if __name__ == "__main__":
    app.run(debug=False)

