console.info("https://gitlab.com/pessiv/contfix by Pessi Vilppolahti")
var wantedColor = "rgb(0,0,0)";
function luminance(l1, l2) {
    var rl1 = lighterColor(l1, l2);
    var rl2 = darkerColor(l1, l2);
    return (rl1 + 0.05) / (rl2 + 0.05);
}
function lighterColor(a, b) {
    if (a >= b) {
        return a;
    } else if (b > a) {
        return b;
    }
}
function darkerColor(a, b) {
    if (a == lighterColor(a, b)) {
        return b;
    } else {
        return a;
    }
}
function isAA(luminance) {
    if (luminance >= 4.5) {
        return true;
    } else {
        return false;
    }
}
function isAAA(luminance) {
    if (luminance >= 7) {
        return true;
    } else {
        return false;
    }
}
function getRank(luminance) {
    return [isAA(luminance), isAAA(luminance)];
}
function getXsRGB(x8bit) {
    return x8bit / 255;
}
function getX(x8bit) {
    var xsrgb = getXsRGB(x8bit);
    if (xsrgb <= 0.03928) {
        return xsrgb / 12.92;
    } else {
        return Math.pow(((xsrgb + 0.0555) / 1.055), 2.4);
    }
}
function getL(r8bit, g8bit, b8bit) {
    return 0.2126 * getX(r8bit) + 0.7152 * getX(g8bit) + 0.0722 * getX(b8bit);
}
function getRelativeLuminance(r8bit1, r8bit2, g8bit1, g8bit2, b8bit1, b8bit2) {
    return luminance(getL(r8bit1, g8bit1, b8bit1), getL(r8bit2, g8bit2, b8bit2));
}
function separateRGBValuesToList(rgbs) {
    var str = rgbs.replace('rgb(', '');
    str = str.replace(')', '');
    var values = str.split(",");
    for (var i = 0; i < values.length; i++) {
        values[i] = parseInt(values[i]);
    }
    return values;
}
function checkForCorrectValue(value) {
    if (value == "") {
        return "rgb(255,255,255)";
    }
    return value;
}
function testContrast(bgc, fgc, ename) {
    var clr1 = separateRGBValuesToList(checkForCorrectValue(bgc));
    var clr2 = separateRGBValuesToList(checkForCorrectValue(fgc));
    var contrastBools = getRank(getRelativeLuminance(clr1[0], clr2[0], clr1[1], clr2[1], clr1[2], clr2[2]));
    if (!contrastBools[0]) {
        console.warn("The contrast on element " + ename + " is not compliant with WCAG AA requirements");
    } else if (!contrastBools[1]) {
        console.warn("The contrast on element " + ename + " is not compliant with WCAG AAA requirements");
    }
    return contrastBools;
}
function testContrasts(list) {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
        arr.push(testContrast(list[i][0], list[i][1], list[i][2]));
    }
    return arr;
}
function findNearestAAA(color) {
    var fgc = color;
    var darkmode = false;
    if (darkmode) {
        for (var i = 0; i < 255; i += 15) {
            for (var j = 0; j < 255; j += 15) {
                for (var k = 0; k < 255; k += 15) {
                    var rgbs = "rgb(" + i.toString() + "," + j.toString() + "," + k.toString() + ")";
                    if (testContrast(rgbs, fgc, fgc)[1]) {
                        console.log(rgbs + " and " + fgc + " are a good combo");
                        return rgbs;
                    }
                }
            }
        }
    } else {
        for (var i = 255; i > 0; i -= 15) {
            for (var j = 255; j > 0; j -= 15) {
                for (var k = 255; k > 0; k -= 15) {
                    var rgbs = "rgb(" + i.toString() + "," + j.toString() + "," + k.toString() + ")";
                    if (testContrast(rgbs, fgc, fgc)[1]) {
                        console.log(rgbs + " and " + fgc + " are a good combo");
                        return rgbs;
                    }
                }
            }
        }
    }
}
function setGoodColorContrastToAnElementById(color, elid) {
    var naaa = findNearestAAA(color);
    document.getElementById(elid).style.color = color;
    document.getElementById(elid).style.backgroundColor = naaa;
    return naaa;
}
function setGoodColorContrastToAnElementAndParentByIds(color, elid1, elid2) {
    var naaa = setGoodColorContrastToAnElementById(color, elid1);
    var naaa2 = setGoodColorContrastToAnElementById(naaa, elid2);
    var naaa3 = findNearestAAA(naaa2);
    document.getElementById(elid2).style.color = naaa3;
    return [naaa, naaa2, naaa3];
}
function sGCCTEAPBI(color, elid1, elid2) {
    return setGoodColorContrastToAnElementAndParentByIds(color, elid1, elid2);
}
function makeAGoodContrastToTheWantedColorAndApplyToThePage(color) {
    return sGCCTEAPBI(color, "tcolor", "bcolor");
}
function mAGCTTWCAATTP(color) {
    return makeAGoodContrastToTheWantedColorAndApplyToThePage(color);
}
function setAAAContrast() {
    console.groupCollapsed("set AAA contrast (tcolor,bcolor)");
    var color = wantedColor;
    var x = mAGCTTWCAATTP(color);
    console.groupEnd();
    return x;
}
function setWantedColor(color) {
    wantedColor = color;
}
function setAAAContrastToListedElementsToo(list) {
    var x = setAAAContrast();
    if (!list.length == 0) {
        for (var i = 0; i < list.length; i++) {
            x.push(setGoodColorContrastToAnElementById(x[-1], list[i]));
        }
    }
    console.groupCollapsed("colors on this page");
    console.table(x);
    console.groupEnd();
    return x;
}
function matchContrastsWithElementsByIds(matchable, matchedList) {
    console.groupCollapsed("colors of the matched elements");
    if (!matchedList.length == 0) {
        for (var i = 0; i < matchedList.length; i++) {
            setGoodColorContrastToAnElementById(document.getElementById(matchable).style.backgroundColor, matchedList[i]);
        }
    }
    console.groupEnd();
}
function fixContrast(wantedColor, elementList, matchable, matchedList) {
    setWantedColor(wantedColor);
    setAAAContrastToListedElementsToo(elementList);
    matchContrastsWithElementsByIds(matchable, matchedList);
}