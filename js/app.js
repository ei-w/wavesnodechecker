var app = angular.module('WavesNodeChecker', ['ngStorage']);

app.controller('NodeRegistrationController', function($scope, $localStorage, $http) {

    $scope.addNode = function() {
        $localStorage.nodes.push($scope.nodeAddress + ":" + $scope.nodePort);
    };

    $scope.init = function() {
        if(!$localStorage.nodes) $localStorage.nodes = [];
    };

    $scope.init();

});

app.controller('NodeCheckController', function($scope, $localStorage) {

    $scope.removeNode = function(node) {
        $scope.nodes.splice($scope.nodes.indexOf(node), 1);
    };

    $scope.init = function() {
        $scope.nodes = $localStorage.nodes;
    };

    $scope.init();

});

app.controller('NodeRefreshController',function($scope, $interval, $localStorage, $http){

    $scope.masterNode = '52.30.47.67:6869';
    $scope.heights = [];
    $scope.versions = [];
    $scope.syncStatus = [];
    $scope.connected = [];
    $scope.check = [];
    $scope.updated = [];

    $scope.checkNode = function(node) {
        if($scope.check[node] != false){
            $scope.requestNode(node)
        }
    };

    $scope.checkNodeRefresh = function(node) {
        $scope.requestNode(node)
        $scope.networkHeight();
    };

    $scope.checkAllNodes = function(loop) {
        $scope.nodes.forEach(function(node) {
            (loop) ? $scope.checkNode(node) : $scope.checkNodeRefresh(node);
        });
    };

    $scope.requestNode = function(node) {

        $http.get('http://' + node + '/blocks/height').then(function(result) {
            $scope.heights[node] = result.data.height;
        });
        $http.get('http://' + node + '/node/version').then(function(result) {
            $scope.versions[node] = result.data.version;
        });
        $http.get('http://' + node + '/blocks/height').then(function(result) {
            $scope.syncStatus[node] = 'Not in sync';
            if(($scope.masterNodeHeight - result.data.height) == 0) $scope.syncStatus[node] = 'In sync'; 
        });
        $http.get('http://' + $scope.masterNode + '/peers/connected').then(function(result) {

            var is_connected = false;
            result.data.peers.forEach(function(peer) {
                if(peer.address.includes(node.split(":")[0])) {
                    is_connected = true;
                }
                (is_connected) ? $scope.connected[node] = "Yes" : $scope.connected[node] = "No";
            });
        });

        $scope.check[node] = false;
        $scope.updated[node] = new Date().toDateString() + " - " + new Date().getHours() + ":" + new Date().getMinutes();
    };

    $scope.refresh = function() {
        $interval(function(){
            if($scope.nodes.length > 0) {
                $scope.checkAllNodes(false);
            }
        },60000);
    };

    $scope.networkHeight = function() {
        $http.get('http://' + $scope.masterNode + '/blocks/height').then(function(result) {
            $scope.masterNodeHeight = result.data.height;
        });
    };

    $scope.init = function() {
        $scope.nodes = $localStorage.nodes;
        $scope.networkHeight();
        $interval(function(){
            if($scope.nodes.length > 0) {
                $scope.note="";
                $scope.checkAllNodes(true);
            }else{
                $scope.note="Add testnet node IP and port to check status";
            }
        },1000);
        $scope.refresh();
    };

    $scope.init();


});