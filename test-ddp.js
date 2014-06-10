Watch = new Meteor.Collection("watches");

UI.registerHelper("format", function(datetime, f) {
  if (moment) {
    return moment(datetime).format(f);
  }
  else {
    return datetime;
  }
});

if (Meteor.isClient) {
  Template.helloMeteor.color = function (){
    if(Meteor.status().status == "connected"){
      return "green";
    } else{
      return "red";
    }
  }

  Template.helloNode.color = function (){
    return Session.get('color')
  }

  Template.helloMeteor.status = function (){
    return Meteor.status().status;
  }

  Template.helloMeteor.now = function(){
    return moment(new Date()).format('dddd DD.MM.YYYY HH:mm:ss');
  }

  Template.helloMeteor.retryCount = function (){
    return Meteor.status().retryCount;
  }

  Template.helloMeteor.reason = function (){
    return Meteor.status().reason;
  }

  Template.helloMeteor.greeting = function () {
    return "Welcome to test-ddp.";
  };

  Template.helloMeteor.rendered = function () {
    Meteor.subscribe('gettime');
  };

  Template.helloNode.rendered = function () {
    Session.set('color','red');
    $.get("/clockapi",function (data){
      $('#nodecontent').html(data.length);
      $('#nodecontent').append("<br/> items<br/>");
      $('#nodecontent').append(moment(new Date()).format());
      Session.set('color','green');
    });
  };

  Template.helloMeteor.times = function () {
    return Watch.find({},{sort: {time: -1}});
  };

  Template.helloNode.events({
    'click #nodereload': function () {
      Session.set('color','red');
      $.get("/clockapi",function (data){
        $('#nodecontent').html(data.length);
        $('#nodecontent').append("<br/> items<br/>");
        $('#nodecontent').append(moment(new Date()).format());
        Session.set('color','green');
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Future = Npm.require('fibers/future');
    var cron = new Cron(60000);
    Watch.remove({});
    var now = new Date().getTime();
    console.log(now);
    Watch.insert({time: now})

    cron.addJob(1,function(){
      var now = new Date().getTime();
      console.log(now);
      Watch.insert({time: now})
    });
  });

  Meteor.publish('gettime', function () {
    return Watch.find({},{sort:{time: -1},limit: 10});
  });

  HTTP.methods({
    'clockapi': function(data){
      return JSON.stringify(Watch.find({},{sort:{time: -1},limit: 10}).fetch())+"";
    },

    'nodeapi': function(data) {
      var fut = new Future();

      Meteor.http.get("http://scipopulis.com/coletivo/stop/at_location/-23.601961,-46.691634",function(err,res){
        console.log(JSON.stringify(res.data));
        fut['return'](JSON.stringify(res.data));
      });

      return fut.wait();
    }
  });
}
