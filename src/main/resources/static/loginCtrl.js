var app = angular.module('demoApp', []);
app.controller('loginController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {

    $rootScope.authenticated = false;
	$scope.headingTitle = 'Login to get started.';

    $scope.logMeIn = function(){
        if(!$scope.userName || !$scope.password){
            $scope.showMessage("Missing required fields.", false);
            return;
        }
        var iv = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
        var salt = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);

        var aesUtil = new AesUtil(128, 1000);
        var ciphertext = aesUtil.encrypt(salt, iv, $('#key').text(), $scope.password);

        var aesPassword = (iv + "::" + salt + "::" + ciphertext);
        var password = btoa(aesPassword);
        var data = {
            userName: $scope.userName,
            password: password
        }

        $http.post('/login',data).then(function (response){
			if(response.data.messageBean.statuscode === 200){
                $localStorage.token = response.headers('Authorization');
				if(response.data.result.role === 'ADMIN'){
                    $localStorage.isAdmin = true;
                    $localStorage.isSuperUser = false;
				} else if(response.data.result.role === 'SU'){
					$localStorage.isSuperUser = true;
                    $localStorage.isAdmin = false;
				}else {
                    $localStorage.isSuperUser = false;
                    $localStorage.isAdmin = false;
				}
                $localStorage.authenticated = true;
				if(!$localStorage.isSuperUser) {
                    $location.path('/sendsms');
                }else {
                    $location.path('/manager');
                }
			} else{
                $scope.showMessage(response.data.messageBean.message, false);
			}
		}).catch(function(error) {
		  console.error('Error occurred: login controller');
		});
	};

	}]);