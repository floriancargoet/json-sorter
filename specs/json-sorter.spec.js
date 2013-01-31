describe('JSON Sorter', function () {
    var JSONSorter = require('../');

    describe('parse', function () {
        it('should just be JSON.parse', function () {
            expect(JSONSorter.parse).toBe(JSON.parse);
        });
    });

    describe('stringify', function () {
        it('should sort keys in lexicographic order by default', function () {
            var obj = {
                c  : '',
                3  : '',
                1  : '',
                a  : '',
                20 : '',
                b  : ''
            };
            var str = JSONSorter.stringify(obj);
            str = str.replace(/[^abc1230]/g, '');

            expect(str).toBe('1203abc');
        });

        it('should handle the undefined case', function () {
            expect(JSONSorter.stringify()).toBeUndefined();
        });

        it('should accept a "replacer" array', function () {
            var obj = {
                a : '',
                b : '',
                c : '',
                d : ''
            };
            var str = JSONSorter.stringify(obj, ['a', 'c']);
            str = str.replace(/[^abcd]/g, '');

            expect(str).toBe('ac');
        });

        it('should accept a "replacer" function', function () {
            var obj = {
                a : '',
                b : '',
                c : '',
                d : ''
            };
            function replacer(key, value) {
                return key ? key : value;
            }

            var str = JSON.stringify(obj, replacer);
            str = str.replace(/[^abcd]/g, '');

            expect(str).toBe('aabbccdd');
        });

        it('should indent output', function () {
        });

        it('should escape keys', function () {
        });
    });

    describe('setOptions', function () {

        describe('sorting options', function () {

            it('should put primitives first', function () {
                JSONSorter.setOptions({
                    primitivesFirst : true
                });
                var str = JSONSorter.stringify({
                    primitive1 : 1,
                    primitive2 : true,
                    object1    : [],
                    object2    : {},
                    primitive3 : '3',
                    primitive4 : null
                });

                expect(str.lastIndexOf('primitive')).toBeLessThan(str.indexOf('object'));
            });

            it('should use the provided sort function', function () {
            });

        });

        describe('formatting options', function () {

            it('should insert spaces before colon', function () {
                JSONSorter.setOptions({
                    spaceBeforeColon : '-' // supposed to be spaces but you can't put anything
                });
                var str = JSONSorter.stringify({
                    primitive1 : 1,
                    primitive2 : true,
                    object1    : [],
                    object2    : {},
                    primitive3 : '3',
                    primitive4 : null
                }, null, 4);

                var i = 0;
                str.replace(/[^\-]-:/g, function() {
                    i++;
                });
                expect(i).toBe(6);
            });

            it('should insert spaces after colon', function () {
            });

            it('should align colons', function () {
            });

            it('should compact arrays', function () {
            });

        });
    });
});
