/**
 * @license nsl-bootstrap-daterangepicker v0.0.5
 * (c) 2013 Luis Farzati http://github.com/luisfarzati/ns-bs-daterangepicker
 *     2016 Ennosol http://github.com/ennosol/nsl-bootstrap-daterangepicker
 * License: MIT
 */
(function (angular) {

    'use strict';

    angular
        .module('nslBootstrapDaterangepicker', [])
        .directive('nslBootstrapDaterangepicker', ['$parse', '$filter', function ($parse, $filter) {
            return {
                restrict: 'AE',
                require: '?ngModel',
                link: function (scope, element, attributes, ngModel) {

                    if (ngModel === null) {
                        return;
                    }

                    var options = {};
                    options.format = attributes.format || 'YYYY-MM-DD';
                    options.separator = attributes.separator || ' - ';
                    options.minDate = attributes.minDate && moment(attributes.minDate);
                    options.maxDate = attributes.maxDate && moment(attributes.maxDate);
                    options.dateLimit = attributes.limit && moment.duration.apply(this, attributes.limit.split(' ').map(function (elem, index) {
                            return index === 0 && parseInt(elem, 10) || elem;
                        }));
                    options.ranges = attributes.ranges && $parse(attributes.ranges)(scope);
                    options.locale = attributes.locale && $parse(attributes.locale)(scope);
                    options.opens = attributes.opens || $parse(attributes.opens)(scope);

                    if (attributes.enabletimepicker) {
                        options.timePicker = true;
                        angular.extend(options, $parse(attributes.enabletimepicker)(scope));
                    }

                    function datify(date) {
                        return moment.isMoment(date) ? date.toDate() : date;
                    }

                    function momentify(date) {
                        return (!moment.isMoment(date)) ? moment(date) : date;
                    }

                    function format(date) {
                        return $filter('date')(datify(date), options.format.replace(/Y/g, 'y').replace(/D/g, 'd')); //date.format(options.format);
                    }

                    function formatted(dates) {
                        return [format(dates.startDate), format(dates.endDate)].join(options.separator);
                    }

                    ngModel.$render = function () {
                        if (!ngModel.$viewValue || !ngModel.$viewValue.startDate) {
                            return;
                        }
                        element.val(formatted(ngModel.$viewValue));
                    };

					attributes.$observe('ngModel', function (value) {
						scope.$watch(value, function (newValue) {
							element.data('daterangepicker').startDate = momentify(newValue.startDate);
							element.data('daterangepicker').endDate = momentify(newValue.endDate);
							element.data('daterangepicker').updateView();
							element.data('daterangepicker').updateCalendars();
							element.data('daterangepicker').updateInputText();
						});
					});

                    scope.$watch(function () {
                        return attributes.ngModel;
                    }, function (modelValue, oldModelValue) {
                        if (!scope[modelValue] || (!scope[modelValue].startDate)) {
                            ngModel.$setViewValue({
                                startDate: moment().startOf('day'),
                                endDate: moment().startOf('day')
                            });
                            ngModel.$render();
                            return;
                        }
                    });

                    element.daterangepicker(options, function (start, end) {
                        var modelValue = ngModel.$viewValue;

                        if (angular.equals(start, modelValue.startDate) && angular.equals(end, modelValue.endDate)) {
                            return;
                        }

                        scope.$apply(function () {
                            ngModel.$setViewValue({
                                startDate: (moment.isMoment(modelValue.startDate)) ? start : start.toDate(),
                                endDate: (moment.isMoment(modelValue.endDate)) ? end : end.toDate()
                            });
                            ngModel.$render();
                        });
                    });
                }
            };
        }]);
})(angular);