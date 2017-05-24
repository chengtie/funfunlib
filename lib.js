// input: {"name": "flare", "children": [{"name": "analytics", "children": [{"name": "cluster", "children": [{"name": "AgglomerativeCluster", "size": 3938}]}]}]}
// output: [["analytics", "flare", null], ["cluster", "analytics", null], ["AgglomerativeCluster", "cluster", 3938], ...
// it is about making "links", so there is no ["flare", "flare", null], ["analytics", "analytics", null]
function tree2table(tree) {
    var children = tree["children"];
    if (children === undefined) return [];
    var result = [];
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var link = [child["name"], tree["name"], child["size"]];
        result.push(link);
        result.push(...tree2table(child))
    }
    return result
}

// input: {"name": "flare", "parent": null, "children": [{"name": "analytics", "parent": "flare", children": [...
// output: [["flare", ""], ["flare.analytics", ""], ["flare.analytics.cluster", ""],["flare.analytics.cluster.AgglomerativeCluster", "3938"]...
// in the input, the "parent" is irrelevant
function tree2dot(tree) {
    function aid(tree, st) {
        var newSt;
        if (st === "") newSt = tree["name"];
        else newSt = st + "." + tree["name"];
        var result = [[newSt, tree["size"]]];  
        var children = tree["children"];
        if (children === undefined) return result;
        for (var i = 0; i < children.length; i++) {
            result.push(...aid(children[i], newSt))
        }
        return result;
    }
    return aid(tree, "")
}

// input: [["analytics", "flare", null], ["cluster", "analytics", null], ["AgglomerativeCluster", "cluster", 3938], ...
// output: {"name": "flare", "parent": null, "children": [{"name": "analytics", "parent": "flare", children": [...
// http://stackoverflow.com/a/17849353/702977
function table2tree(table) {
    var csv = table2csv(table, { "hasHeaders": false, "headers": ["name", "parent", "size"] });

    // create a name: node map
    var dataMap = csv.reduce(function (map, node) {
        map[node.name] = node;
        return map;
    }, {});

    // create the tree array
    var tree = [];
    csv.forEach(function (node) {
        // add to parent
        var parent = dataMap[node.parent];
        if (parent) {
            // create child array if it doesn't exist
            (parent.children || (parent.children = []))
                // add node to child array
                .push(node);
        } else {
            // parent is null or missing
            tree.push(node);
        }
    });

    if (tree === []) return {};
    else { alert(JSON.stringify(tree)); if (tree[0].parent === null) return tree[0]; 
    else return { "name": tree[0].parent, "parent": null, "children": tree }; // add "flare" }
}

// input: [["analytics", "flare", null], ["cluster", "analytics", null], ["AgglomerativeCluster", "cluster", 3938], ...
// output: [{"name": "analytics", "parent": "flare", "size": null}, ..., {"name": "AgglomerativeCluster", "parent": "cluster", "size": 3938}
function table2csv(aa, opt) {
    var headers;
    var start;
    if (opt.hasHeaders) {
        headers = [];
        for (var i = 0; i < aa[0].length; i++) {
            headers.push(aa[0][i])
        };
        start = 1;
    } else {
        headers = opt.headers;
        start = 0;
    }
    var r = [];
    for (var i = start; i < aa.length; i++) {
        var row = {};
        for (var j = 0; j < aa[i].length; j++) {
            row[headers[j]] = aa[i][j];
        }
        r.push(row)
    }
    return r
}

// input: [["flare", ""], ["flare.analytics", ""], ["flare.analytics.cluster", ""],["flare.analytics.cluster.AgglomerativeCluster", "3938"]...
// output: [["flare", null, ""], ["analytics", "flare", ""], ["AgglomerativeCluster", "cluster", 3938]...
function dot2table(dot) {
    var result = dot.map(function (d) {
        var id = d[0];
        if (id.indexOf(".") === -1) return ([id, null, d[1]])
        else {
            var child = id.substring(id.lastIndexOf(".")+1, id.length)
            var rest = id.substring(0, id.lastIndexOf("."));
            var parent;
            if (rest.indexOf(".") === -1) parent = rest
            else parent = rest.substring(rest.lastIndexOf(".")+1, rest.length);
            return ([child, parent, d[1]])
        }
    })
    return result;
}

// input: [["flare", null, null], ["analytics", "flare", null], ["AgglomerativeCluster", "cluster", 3938]...
// output: [["flare", ""], ["flare.analytics", ""], ["flare.analytics.cluster", ""],["flare.analytics.cluster.AgglomerativeCluster", "3938"]...
function table2dot(table) {
    var tree = table2tree(table);
    var dot = tree2dot(tree);
    return dot
}

// input: [["Date", "Open"], ["2010-10-01", "10789.72"]], ...]
// output: a csv that can be used in d3
// eg: for https://www.funfun.io/edit/5924fca604ce702ccfb22b06
function array2csv(aa, opt) {
    var headers;
    var start;
    if (opt.hasHeaders) {
        headers = [];
        for (var i=0; i < aa[0].length; i++)
            headers.push(aa[0][i])
        start = 1;
    } else {
        headers = opt.headers;  
        start = 0;
    }
    var r = [];
    for (var i=start; i < aa.length; i++) {
        var row = {};
        for (var j=0; j < aa[i].length; j++)
            row[headers[j]] = aa[i][j];
        r.push(row)
    }
    return r
}