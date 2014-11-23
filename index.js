var noble = require('noble');
var _     = require('lodash');

// TesselのBLEモジュールのサービス/キャラクタリスティクスのUUID達
// uuids for Services and characteristics of Tessel BLE module
// see  https://github.com/tessel/ble-ble113a/blob/master/lib/profile.json
var UUIDs = {
  service: "d752c5fb13804cd5b0efcac7d72cff20".replace(/\-/g, ''),
  readCh: "883f1e6b76f64da187eb6bdbdb617888",
  writeCh: "57b09eaea3694677bf6e92a95baa3a38",
};

noble.on('discover', function(peripheral){
  console.log("device found");
  peripheral.connect(function(){

    console.log("connected");
    peripheral.discoverServices([], function(err, services){

      var service = _.find( services, function(service){
       return service.uuid === UUIDs.service;
      });

      service.discoverCharacteristics([], function(err, chars){

        /////////////////////
        // READING-FROM-TESSEL
        var ch = _.find(chars, function(char){
          return char.uuid === UUIDs.readCh;
        });

        ch.on("read", function(data){
          console.log( "read data: " + data.toString());
        });
        setInterval(function(){
          ch.read();
        },1000);

        /////////////////////
        // WRITING-TO-TESSEL
        var chWrite = _.find(chars, function(char){
          return char.uuid === UUIDs.writeCh;
        });
        setInterval(function(){
          chWrite.write( new Buffer("hello tessel!") );
        },2000);

      });


      ////////////////////////////////////////////
      // disconnect when process exits
      // プロセス殺すときに接続を切る
      var signals = ['SIGINT', 'SIGHUP', 'SIGTERM'];
      for(var i=0; i < signals.length ; i++){
        var signal = signals[ i ];
        process.on(signal,function(){ 
          peripheral.disconnect( function(){
            console.log("fin");
            process.exit(1);
          });
        });
      }

    });

  });
});

noble.startScanning()
