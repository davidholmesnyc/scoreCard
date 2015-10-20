var request = require('request');
var MongoClient = require('mongodb').MongoClient
var API_KEY = 'YOUR-GOV-KEY';

var crawler = {
  CRAWL_URL:function(){
    return  'https://api.data.gov/ed/collegescorecard/v1/schools?per_page=100&api_key='+API_KEY+'&page='+this.current_page
  },
  'current_page':0,
  'crawl':function(){
    var self = this
    request(self.CRAWL_URL(), function (error, response, body) {
      try {
        var body = JSON.parse(body)
        if (!error && response.statusCode == 200 && body.results.length != 0) {
          self.current_page = Number(body.metadata.page) + 1
          self.save(body)
          self.next_page()
        }else{ return false; }
      }
      catch(err) {
        self.crawl()
      }
    })
  },
  'next_page':function(){
      this.crawl();
  },
  'save':function(data){
      MongoClient.connect('mongodb://127.0.0.1:27017/college_score_card', function(err, db) {
      if(err) throw err;
      var results = data.results 
      var collection = db.collection('data');
      for (var i = 0; i < results.length; i++) {
        var result = results[i]
        result.metadata = data.metadata
        collection.insert(result, function(err, docs) {
          db.close()
          console.log("saved -",i)
        });

      };
    })
  }
}

crawler.crawl()