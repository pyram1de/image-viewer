(
    function(){
        var app = angular.module('myApp' , ['ngMaterial']);
        app.controller('MainController',['$scope','$mdDialog','$http', function($scope,$mdDialog,$http){
            $scope.place = "world";
            $scope.memberData = {};
            $scope.getNiceDate = function(input){
                console.log(input);
                var nicedate = moment(input,'DD/MM/YYYY').format('DD MMM YYYY');
                console.log(nicedate);
                //return input;
                return nicedate;
            };

            $scope.updateFromNino = function(){
                $scope.picked = undefined;
                if(!$scope.nino){
                    $scope.memberData = {};
                    $scope.nino = "";
                    return;
                }
                    $http.get('_api/people/getByNino/'+$scope.nino).then(function(res){
                        $scope.memberData = res.data;
                    });
                }

            $scope.updateFromSurname = function(){
                $scope.picked = undefined;
                if(!$scope.surname){
                    $scope.memberData = {};
                    $scope.surname = "";
                    return;
                }
                    $http.get('_api/people/getBySurname/'+$scope.surname).then(function(res){
                        $scope.memberData = res.data;
                    });
                }
            $scope.getImageUrl = function(tiff){
                var returnVal = '';
                switch(tiff.fileExtension){
                    case 'pdf' :
                    case 'PDF' :
                        returnVal = '/images/picture_as_pdf_black_54x54.png';
                        break;
                    case 'tif' :
                        returnVal = '/images/insert_photo_black_54x54.png';
                        break;
                    case 'rtf' :
                        returnVal = '/images/my_library_books_black_54x54.png';
                        break;
                    default : 
                        returnVal = '/images/settings_ethernet_black_54x54.png';
                        break;
                }
                return returnVal;
            }
            $scope.currentpage = 0;
            $scope.pageQuery = "";
            $scope.getPagedResults = function(query, value){
                $scope.picked=null;
                console.log('getPagedResults');
                $scope.pageQuery = '_api/people/'+query+'/'+value;
                console.log($scope.pageQuery);
                $scope.currentpage = 1;
                $http.get($scope.pageQuery +'/page/'+$scope.currentpage ).then(function(res){
                    console.log('updated data');
                    console.log(res.data.length);
                    console.log($scope.currentpage);
                    $scope.memberData = res.data;
                });
            }

            $scope.getNextPage = function(){
                $scope.currentpage += 1;
                $http.get($scope.pageQuery +'/page/'+$scope.currentpage ).then(function(res){
                    console.log('updated data');
                    console.log(res.data.length);
                    console.log($scope.currentpage);
                    $scope.memberData = res.data;
                });
            }

            $scope.getPrevPage = function(){
                $scope.currentpage -= 1;
                $http.get($scope.pageQuery +'/page/'+$scope.currentpage ).then(function(res){
                    console.log('updated data');
                    console.log(res.data.length);
                    console.log($scope.currentpage);
                    $scope.memberData = res.data;
                });
            }

            $scope.getImage = function(image){
                $http.post('_api/imagedata/',image).then(function(test){
                    console.log(test);
                    if(test.status===200){
                        window.open(test.data);
                    }
                });
            }

            $scope.getTiff = function(tiff){
                console.log('getting tiff');
                $http.post('_api/getTiff/',tiff).then(function(result){
                    if(result.status===200){
                        window.open(result.data);
                    }
                });
            }

            $scope.pickItem = function(item){
                $scope.memberData = {};
                $scope.nino = "";
                $scope.picked = item;
                $scope.images = item.images;
                $scope.tiffs = item.tiffs;
            }
        }])
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('default')
            .primaryPalette('indigo', {
            'default': '400', // by default use shade 400 from the pink palette for primary intentions
            'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('green')
            $mdThemingProvider.theme('default-grey').backgroundPalette('grey');
            $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
            $mdThemingProvider.theme('default-orange')
                .accentPalette('green')
                .backgroundPalette('deep-orange');
            //$mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
            //$mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
        });
    }
)();