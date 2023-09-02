class SvgFactory {
    static build(name, color, extra) {
        switch (name) {
            case 'down': return this.arrowDown(color, extra);
            case 'up': return this.arrowUp(color, extra);
            case 'back': return this.arrowBack(color, extra);
            case 'check': return this.checkmark(color, extra);
            case 'cross': return this.crossmark(color, extra);
            case 'switch3': return this.switchThree(color, extra);
            case 'loading': default: return this.loading(color, extra);
        }
    }

    static arrowBack(color) {
        const svgArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgArrow.setAttribute('viewBox', '0 0 60 60');

        const pathArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathArrow.setAttribute('d', 'M54,44c-5.93-5.32-17.21-9-29-9H24V50L3,29,24,8V21h1C39,21,51.28,31.53,54,44Z');
        pathArrow.style.fill = color;
        pathArrow.style.stroke = color;
        pathArrow.style.strokeWidth = '6px';

        svgArrow.appendChild(pathArrow);
        return svgArrow;
    }

    static switchThree(colorOff, colorOn) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("viewBox", "0 0 60 60");

        let circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle1.setAttribute("fill", colorOff);
        circle1.setAttribute("cx", "45");
        circle1.setAttribute("cy", "30");
        circle1.setAttribute("r", "10");

        let circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle2.setAttribute("fill", colorOn);
        circle2.setAttribute("cx", "22.5");
        circle2.setAttribute("cy", "42.94");
        circle2.setAttribute("r", "10");

        let circle3 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle3.setAttribute("fill", colorOn);
        circle3.setAttribute("cx", "22.5");
        circle3.setAttribute("cy", "16.96");
        circle3.setAttribute("r", "10");

        svg.appendChild(circle1);
        svg.appendChild(circle2);
        svg.appendChild(circle3);

        return svg;
    }

    static arrowDown(color) {
        const down = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        down.setAttribute('viewBox', '0 0 60 60');

        const arrowDown = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        arrowDown.setAttribute('points', '12 18 30 40 48 18 12 18');
        arrowDown.style.fill = color;
        arrowDown.style.stroke = color;
        arrowDown.style.strokeWidth = '6px';
        down.append(arrowDown);
        return down;
    }

    static arrowUp(color) {
        const up = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        up.setAttribute('viewBox', '0 0 60 60');

        const arrowUp = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        arrowUp.setAttribute('points', '12 40 30 18 48 40 12 40');
        arrowUp.style.fill = color;
        arrowUp.style.stroke = color;
        arrowUp.style.strokeWidth = '6px';
        up.append(arrowUp);
        return up;

    }

    static arrowsUpAndDown(color) {
        const arrows = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrows.setAttribute('viewBox', '0 0 60 60');

        const arrowUp = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        arrowUp.setAttribute('points', '12 21 30 3 48 21 12 21');
        arrowUp.style.fill = color;
        arrowUp.style.stroke = color;
        arrowUp.style.strokeWidth = '6px';
        arrows.append(arrowUp);

        const arrowDown = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        arrowDown.setAttribute('points', '12 39 30 57 48 39 12 39');
        arrowDown.style.fill = color;
        arrowDown.style.stroke = color;
        arrowDown.style.strokeWidth = '6px';
        arrows.append(arrowDown);
        return arrows;
    }

    static checkmark(color, traceid) {
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('viewBox', '0 0 60 60');

        const polylineElement = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polylineElement.setAttribute('points', '7 30 22 45 51 16');
        polylineElement.style.fill = 'none';
        polylineElement.style.stroke = color;
        polylineElement.style.strokeWidth = '12px';
        if (traceid) {
            polylineElement.id = traceid;
        }

        svgElement.appendChild(polylineElement);

        return svgElement;
    }

    static crossmark(color) {
        const svgCross = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgCross.setAttribute('viewBox', '0 0 60 60');

        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.style.fill = 'none';
        line1.style.stroke = color;
        line1.style.strokeWidth = '12px';
        line1.setAttribute('x1', '13');
        line1.setAttribute('y1', '13');
        line1.setAttribute('x2', '47');
        line1.setAttribute('y2', '47');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.style.fill = 'none';
        line2.style.stroke = color;
        line2.style.strokeWidth = '12px';
        line2.setAttribute('x1', '47');
        line2.setAttribute('y1', '13');
        line2.setAttribute('x2', '13');
        line2.setAttribute('y2', '47');

        svgCross.appendChild(line1);
        svgCross.appendChild(line2);
        return svgCross;
    }

    static loading(color) {
        const svgNamespace = 'http://www.w3.org/2000/svg';
        const svgElement = document.createElementNS(svgNamespace, 'svg');
        svgElement.setAttribute("viewBox", "0 0 60 60");

        const path1 = document.createElementNS(svgNamespace, "path");
        path1.setAttribute("style", "fill: none; stroke-miterlimit:10; stroke-width:4px; stroke: " + color + ";");
        path1.setAttribute("d", "M7.61,27.73A22.51,22.51,0,0,1,30,7.5a21.89,21.89,0,0,1,2.94.19");

        const path2 = document.createElementNS(svgNamespace, "path");
        path2.setAttribute("style", "fill: none; stroke-miterlimit:10; stroke-width:4px; stroke: " + color + ";");
        path2.setAttribute("d", "M52,34.87a22.44,22.44,0,0,1-6.06,11");

        const path3 = document.createElementNS(svgNamespace, "path");
        path3.setAttribute("style", "fill: none; stroke-miterlimit:10; stroke-width:4px; stroke: " + color + ";");
        path3.setAttribute("d", "M38.61,9.21A22.52,22.52,0,0,1,52.48,29");

        const polygon = document.createElementNS(svgNamespace, "polygon");
        polygon.setAttribute("style", "stroke: " + color + "; fill:" + color + "; stroke-width:2px;");
        polygon.setAttribute("points", "2.46 27.9 8.09 31.96 12.93 26.98 2.46 27.9");

        const path4 = document.createElementNS(svgNamespace, "path");
        path4.setAttribute("style", "fill:" + color + ";");
        path4.setAttribute("d", "M41.25,51.36a1.88,1.88,0,0,0,0-3.75,1.88,1.88,0,0,0,0,3.75Z");

        const path5 = document.createElementNS(svgNamespace, "path");
        path5.setAttribute("style", "fill:" + color + ";");
        path5.setAttribute("d", "M35.82,53.61a1.88,1.88,0,0,0,0-3.75,1.88,1.88,0,0,0,0,3.75Z");

        const path6 = document.createElementNS(svgNamespace, "path");
        path6.setAttribute("style", "fill:" + color + ";");
        path6.setAttribute("d", "M30,54.38a1.88,1.88,0,0,0,0-3.75,1.88,1.88,0,0,0,0,3.75Z");

        svgElement.appendChild(path1);
        svgElement.appendChild(path2);
        svgElement.appendChild(path3);
        svgElement.appendChild(polygon);
        svgElement.appendChild(path4);
        svgElement.appendChild(path5);
        svgElement.appendChild(path6);
        return svgElement;
    }
}