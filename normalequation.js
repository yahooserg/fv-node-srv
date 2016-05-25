/*jslint nomen: true, node: true, unparam: true*/
(function () {
    'use strict';
    var matrices,
        Matrix = require('matrixmath/Matrix');

    matrices = function (inMatrixVector, rows, cols, inVector) {
        var matrix = new Matrix(rows, cols),
            vector = new Matrix(rows, 1),
            matrix2 = new Matrix(rows, cols),
            matrix3 = new Matrix(rows, cols);
        matrix.setData(inMatrixVector, rows, cols);
        matrix2.setData(inMatrixVector, rows, cols);
        matrix3.setData(inMatrixVector, rows, cols);
        vector.setData(inVector);
        matrix.transpose();
        matrix.multiply(matrix2);
        matrix.invert();
        matrix3.transpose();
        matrix.multiply(matrix3);
        matrix.multiply(vector);
        return matrix.toArray();
    };

    module.exports = matrices;
}());
