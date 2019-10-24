! function() {
    var t, l, c, e, r, h, d, f, p, y, m, g, x, v, w, Q, k, S, E, L, b, P, T, O, I, i, n, s, z = function(e) {
        var t = new z.Builder;
        return t.pipeline.add(z.trimmer, z.stopWordFilter, z.stemmer), t.searchPipeline.add(z.stemmer), e.call(t, t), t.build()
    };
    z.version = "2.3.5", z.utils = {}, z.utils.warn = (t = this, function(e) {
        t.console && console.warn && console.warn(e)
    }), z.utils.asString = function(e) {
        return null == e ? "" : e.toString()
    }, z.utils.clone = function(e) {
        if (null == e) return e;
        for (var t = Object.create(null), r = Object.keys(e), i = 0; i < r.length; i++) {
            var n = r[i],
                s = e[n];
            if (Array.isArray(s)) t[n] = s.slice();
            else {
                if ("string" != typeof s && "number" != typeof s && "boolean" != typeof s) throw new TypeError("clone is not deep and does not support nested objects");
                t[n] = s
            }
        }
        return t
    }, z.FieldRef = function(e, t, r) {
        this.docRef = e, this.fieldName = t, this._stringValue = r
    }, z.FieldRef.joiner = "/", z.FieldRef.fromString = function(e) {
        var t = e.indexOf(z.FieldRef.joiner);
        if (-1 === t) throw "malformed field ref string";
        var r = e.slice(0, t),
            i = e.slice(t + 1);
        return new z.FieldRef(i, r, e)
    }, z.FieldRef.prototype.toString = function() {
        return null == this._stringValue && (this._stringValue = this.fieldName + z.FieldRef.joiner + this.docRef), this._stringValue
    }, z.Set = function(e) {
        if (this.elements = Object.create(null), e) {
            this.length = e.length;
            for (var t = 0; t < this.length; t++) this.elements[e[t]] = !0
        } else this.length = 0
    }, z.Set.complete = {
        intersect: function(e) {
            return e
        },
        union: function(e) {
            return e
        },
        contains: function() {
            return !0
        }
    }, z.Set.empty = {
        intersect: function() {
            return this
        },
        union: function(e) {
            return e
        },
        contains: function() {
            return !1
        }
    }, z.Set.prototype.contains = function(e) {
        return !!this.elements[e]
    }, z.Set.prototype.intersect = function(e) {
        var t, r, i, n = [];
        if (e === z.Set.complete) return this;
        if (e === z.Set.empty) return e;
        r = this.length < e.length ? (t = this, e) : (t = e, this), i = Object.keys(t.elements);
        for (var s = 0; s < i.length; s++) {
            var o = i[s];
            o in r.elements && n.push(o)
        }
        return new z.Set(n)
    }, z.Set.prototype.union = function(e) {
        return e === z.Set.complete ? z.Set.complete : e === z.Set.empty ? this : new z.Set(Object.keys(this.elements).concat(Object.keys(e.elements)))
    }, z.idf = function(e, t) {
        var r = 0;
        for (var i in e) "_index" != i && (r += Object.keys(e[i]).length);
        var n = (t - r + .5) / (r + .5);
        return Math.log(1 + Math.abs(n))
    }, z.Token = function(e, t) {
        this.str = e || "", this.metadata = t || {}
    }, z.Token.prototype.toString = function() {
        return this.str
    }, z.Token.prototype.update = function(e) {
        return this.str = e(this.str, this.metadata), this
    }, z.Token.prototype.clone = function(e) {
        return e = e || function(e) {
            return e
        }, new z.Token(e(this.str, this.metadata), this.metadata)
    }, z.tokenizer = function(e, t) {
        if (null == e || null == e) return [];
        if (Array.isArray(e)) return e.map(function(e) {
            return new z.Token(z.utils.asString(e).toLowerCase(), z.utils.clone(t))
        });
        for (var r = e.toString().trim().toLowerCase(), i = r.length, n = [], s = 0, o = 0; s <= i; s++) {
            var a = s - o;
            if (r.charAt(s).match(z.tokenizer.separator) || s == i) {
                if (0 < a) {
                    var u = z.utils.clone(t) || {};
                    u.position = [o, a], u.index = n.length, n.push(new z.Token(r.slice(o, s), u))
                }
                o = s + 1
            }
        }
        return n
    }, z.tokenizer.separator = /[\s\-]+/, z.Pipeline = function() {
        this._stack = []
    }, z.Pipeline.registeredFunctions = Object.create(null), z.Pipeline.registerFunction = function(e, t) {
        t in this.registeredFunctions && z.utils.warn("Overwriting existing registered function: " + t), e.label = t, z.Pipeline.registeredFunctions[e.label] = e
    }, z.Pipeline.warnIfFunctionNotRegistered = function(e) {
        e.label && e.label in this.registeredFunctions || z.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n", e)
    }, z.Pipeline.load = function(e) {
        var r = new z.Pipeline;
        return e.forEach(function(e) {
            var t = z.Pipeline.registeredFunctions[e];
            if (!t) throw new Error("Cannot load unregistered function: " + e);
            r.add(t)
        }), r
    }, z.Pipeline.prototype.add = function() {
        Array.prototype.slice.call(arguments).forEach(function(e) {
            z.Pipeline.warnIfFunctionNotRegistered(e), this._stack.push(e)
        }, this)
    }, z.Pipeline.prototype.after = function(e, t) {
        z.Pipeline.warnIfFunctionNotRegistered(t);
        var r = this._stack.indexOf(e);
        if (-1 == r) throw new Error("Cannot find existingFn");
        r += 1, this._stack.splice(r, 0, t)
    }, z.Pipeline.prototype.before = function(e, t) {
        z.Pipeline.warnIfFunctionNotRegistered(t);
        var r = this._stack.indexOf(e);
        if (-1 == r) throw new Error("Cannot find existingFn");
        this._stack.splice(r, 0, t)
    }, z.Pipeline.prototype.remove = function(e) {
        var t = this._stack.indexOf(e); - 1 != t && this._stack.splice(t, 1)
    }, z.Pipeline.prototype.run = function(e) {
        for (var t = this._stack.length, r = 0; r < t; r++) {
            for (var i = this._stack[r], n = [], s = 0; s < e.length; s++) {
                var o = i(e[s], s, e);
                if (void 0 !== o && "" !== o)
                    if (Array.isArray(o))
                        for (var a = 0; a < o.length; a++) n.push(o[a]);
                    else n.push(o)
            }
            e = n
        }
        return e
    }, z.Pipeline.prototype.runString = function(e, t) {
        var r = new z.Token(e, t);
        return this.run([r]).map(function(e) {
            return e.toString()
        })
    }, z.Pipeline.prototype.reset = function() {
        this._stack = []
    }, z.Pipeline.prototype.toJSON = function() {
        return this._stack.map(function(e) {
            return z.Pipeline.warnIfFunctionNotRegistered(e), e.label
        })
    }, z.Vector = function(e) {
        this._magnitude = 0, this.elements = e || []
    }, z.Vector.prototype.positionForIndex = function(e) {
        if (0 == this.elements.length) return 0;
        for (var t = 0, r = this.elements.length / 2, i = r - t, n = Math.floor(i / 2), s = this.elements[2 * n]; 1 < i && (s < e && (t = n), e < s && (r = n), s != e);) i = r - t, n = t + Math.floor(i / 2), s = this.elements[2 * n];
        return s == e ? 2 * n : e < s ? 2 * n : s < e ? 2 * (n + 1) : void 0
    }, z.Vector.prototype.insert = function(e, t) {
        this.upsert(e, t, function() {
            throw "duplicate index"
        })
    }, z.Vector.prototype.upsert = function(e, t, r) {
        this._magnitude = 0;
        var i = this.positionForIndex(e);
        this.elements[i] == e ? this.elements[i + 1] = r(this.elements[i + 1], t) : this.elements.splice(i, 0, e, t)
    }, z.Vector.prototype.magnitude = function() {
        if (this._magnitude) return this._magnitude;
        for (var e = 0, t = this.elements.length, r = 1; r < t; r += 2) {
            var i = this.elements[r];
            e += i * i
        }
        return this._magnitude = Math.sqrt(e)
    }, z.Vector.prototype.dot = function(e) {
        for (var t = 0, r = this.elements, i = e.elements, n = r.length, s = i.length, o = 0, a = 0, u = 0, l = 0; u < n && l < s;)(o = r[u]) < (a = i[l]) ? u += 2 : a < o ? l += 2 : o == a && (t += r[u + 1] * i[l + 1], u += 2, l += 2);
        return t
    }, z.Vector.prototype.similarity = function(e) {
        return this.dot(e) / this.magnitude() || 0
    }, z.Vector.prototype.toArray = function() {
        for (var e = new Array(this.elements.length / 2), t = 1, r = 0; t < this.elements.length; t += 2, r++) e[r] = this.elements[t];
        return e
    }, z.Vector.prototype.toJSON = function() {
        return this.elements
    }, z.stemmer = (l = {
        ational: "ate",
        tional: "tion",
        enci: "ence",
        anci: "ance",
        izer: "ize",
        bli: "ble",
        alli: "al",
        entli: "ent",
        eli: "e",
        ousli: "ous",
        ization: "ize",
        ation: "ate",
        ator: "ate",
        alism: "al",
        iveness: "ive",
        fulness: "ful",
        ousness: "ous",
        aliti: "al",
        iviti: "ive",
        biliti: "ble",
        logi: "log"
    }, c = {
        icate: "ic",
        ative: "",
        alize: "al",
        iciti: "ic",
        ical: "ic",
        ful: "",
        ness: ""
    }, e = "[aeiouy]", r = "[^aeiou][^aeiouy]*", h = new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*"), d = new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*"), f = new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$"), p = new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy]"), y = /^(.+?)(ss|i)es$/, m = /^(.+?)([^s])s$/, g = /^(.+?)eed$/, x = /^(.+?)(ed|ing)$/, v = /.$/, w = /(at|bl|iz)$/, Q = new RegExp("([^aeiouylsz])\\1$"), k = new RegExp("^" + r + e + "[^aeiouwxy]$"), S = /^(.+?[^aeiou])y$/, E = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/, L = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/, b = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/, P = /^(.+?)(s|t)(ion)$/, T = /^(.+?)e$/, O = /ll$/, I = new RegExp("^" + r + e + "[^aeiouwxy]$"), i = function(e) {
        var t, r, i, n, s, o, a;
        if (e.length < 3) return e;
        if ("y" == (i = e.substr(0, 1)) && (e = i.toUpperCase() + e.substr(1)), s = m, (n = y).test(e) ? e = e.replace(n, "$1$2") : s.test(e) && (e = e.replace(s, "$1$2")), s = x, (n = g).test(e)) {
            var u = n.exec(e);
            (n = h).test(u[1]) && (n = v, e = e.replace(n, ""))
        } else if (s.test(e)) {
            t = (u = s.exec(e))[1], (s = p).test(t) && (o = Q, a = k, (s = w).test(e = t) ? e += "e" : o.test(e) ? (n = v, e = e.replace(n, "")) : a.test(e) && (e += "e"))
        }(n = S).test(e) && (e = (t = (u = n.exec(e))[1]) + "i");
        (n = E).test(e) && (t = (u = n.exec(e))[1], r = u[2], (n = h).test(t) && (e = t + l[r]));
        (n = L).test(e) && (t = (u = n.exec(e))[1], r = u[2], (n = h).test(t) && (e = t + c[r]));
        if (s = P, (n = b).test(e)) t = (u = n.exec(e))[1], (n = d).test(t) && (e = t);
        else if (s.test(e)) {
            t = (u = s.exec(e))[1] + u[2], (s = d).test(t) && (e = t)
        }(n = T).test(e) && (t = (u = n.exec(e))[1], s = f, o = I, ((n = d).test(t) || s.test(t) && !o.test(t)) && (e = t));
        return s = d, (n = O).test(e) && s.test(e) && (n = v, e = e.replace(n, "")), "y" == i && (e = i.toLowerCase() + e.substr(1)), e
    }, function(e) {
        return e.update(i)
    }), z.Pipeline.registerFunction(z.stemmer, "stemmer"), z.generateStopWordFilter = function(e) {
        var t = e.reduce(function(e, t) {
            return e[t] = t, e
        }, {});
        return function(e) {
            if (e && t[e.toString()] !== e.toString()) return e
        }
    }, z.stopWordFilter = z.generateStopWordFilter(["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your"]), z.Pipeline.registerFunction(z.stopWordFilter, "stopWordFilter"), z.trimmer = function(e) {
        return e.update(function(e) {
            return e.replace(/^\W+/, "").replace(/\W+$/, "")
        })
    }, z.Pipeline.registerFunction(z.trimmer, "trimmer"), z.TokenSet = function() {
        this.final = !1, this.edges = {}, this.id = z.TokenSet._nextId, z.TokenSet._nextId += 1
    }, z.TokenSet._nextId = 1, z.TokenSet.fromArray = function(e) {
        for (var t = new z.TokenSet.Builder, r = 0, i = e.length; r < i; r++) t.insert(e[r]);
        return t.finish(), t.root
    }, z.TokenSet.fromClause = function(e) {
        return "editDistance" in e ? z.TokenSet.fromFuzzyString(e.term, e.editDistance) : z.TokenSet.fromString(e.term)
    }, z.TokenSet.fromFuzzyString = function(e, t) {
        for (var r = new z.TokenSet, i = [{
                node: r,
                editsRemaining: t,
                str: e
            }]; i.length;) {
            var n, s, o, a = i.pop();
            if (0 < a.str.length)(s = a.str.charAt(0)) in a.node.edges ? n = a.node.edges[s] : (n = new z.TokenSet, a.node.edges[s] = n), 1 == a.str.length && (n.final = !0), i.push({
                node: n,
                editsRemaining: a.editsRemaining,
                str: a.str.slice(1)
            });
            if (0 < a.editsRemaining && 1 < a.str.length)(s = a.str.charAt(1)) in a.node.edges ? o = a.node.edges[s] : (o = new z.TokenSet, a.node.edges[s] = o), a.str.length <= 2 ? o.final = !0 : i.push({
                node: o,
                editsRemaining: a.editsRemaining - 1,
                str: a.str.slice(2)
            });
            if (0 < a.editsRemaining && 1 == a.str.length && (a.node.final = !0), 0 < a.editsRemaining && 1 <= a.str.length) {
                if ("*" in a.node.edges) var u = a.node.edges["*"];
                else {
                    u = new z.TokenSet;
                    a.node.edges["*"] = u
                }
                1 == a.str.length ? u.final = !0 : i.push({
                    node: u,
                    editsRemaining: a.editsRemaining - 1,
                    str: a.str.slice(1)
                })
            }
            if (0 < a.editsRemaining) {
                if ("*" in a.node.edges) var l = a.node.edges["*"];
                else {
                    l = new z.TokenSet;
                    a.node.edges["*"] = l
                }
                0 == a.str.length ? l.final = !0 : i.push({
                    node: l,
                    editsRemaining: a.editsRemaining - 1,
                    str: a.str
                })
            }
            if (0 < a.editsRemaining && 1 < a.str.length) {
                var c, h = a.str.charAt(0),
                    d = a.str.charAt(1);
                d in a.node.edges ? c = a.node.edges[d] : (c = new z.TokenSet, a.node.edges[d] = c), 1 == a.str.length ? c.final = !0 : i.push({
                    node: c,
                    editsRemaining: a.editsRemaining - 1,
                    str: h + a.str.slice(2)
                })
            }
        }
        return r
    }, z.TokenSet.fromString = function(e) {
        for (var t = new z.TokenSet, r = t, i = 0, n = e.length; i < n; i++) {
            var s = e[i],
                o = i == n - 1;
            if ("*" == s)(t.edges[s] = t).final = o;
            else {
                var a = new z.TokenSet;
                a.final = o, t.edges[s] = a, t = a
            }
        }
        return r
    }, z.TokenSet.prototype.toArray = function() {
        for (var e = [], t = [{
                prefix: "",
                node: this
            }]; t.length;) {
            var r = t.pop(),
                i = Object.keys(r.node.edges),
                n = i.length;
            r.node.final && (r.prefix.charAt(0), e.push(r.prefix));
            for (var s = 0; s < n; s++) {
                var o = i[s];
                t.push({
                    prefix: r.prefix.concat(o),
                    node: r.node.edges[o]
                })
            }
        }
        return e
    }, z.TokenSet.prototype.toString = function() {
        if (this._str) return this._str;
        for (var e = this.final ? "1" : "0", t = Object.keys(this.edges).sort(), r = t.length, i = 0; i < r; i++) {
            var n = t[i];
            e = e + n + this.edges[n].id
        }
        return e
    }, z.TokenSet.prototype.intersect = function(e) {
        for (var t = new z.TokenSet, r = void 0, i = [{
                qNode: e,
                output: t,
                node: this
            }]; i.length;) {
            r = i.pop();
            for (var n = Object.keys(r.qNode.edges), s = n.length, o = Object.keys(r.node.edges), a = o.length, u = 0; u < s; u++)
                for (var l = n[u], c = 0; c < a; c++) {
                    var h = o[c];
                    if (h == l || "*" == l) {
                        var d = r.node.edges[h],
                            f = r.qNode.edges[l],
                            p = d.final && f.final,
                            y = void 0;
                        h in r.output.edges ? (y = r.output.edges[h]).final = y.final || p : ((y = new z.TokenSet).final = p, r.output.edges[h] = y), i.push({
                            qNode: f,
                            output: y,
                            node: d
                        })
                    }
                }
        }
        return t
    }, z.TokenSet.Builder = function() {
        this.previousWord = "", this.root = new z.TokenSet, this.uncheckedNodes = [], this.minimizedNodes = {}
    }, z.TokenSet.Builder.prototype.insert = function(e) {
        var t, r = 0;
        if (e < this.previousWord) throw new Error("Out of order word insertion");
        for (var i = 0; i < e.length && i < this.previousWord.length && e[i] == this.previousWord[i]; i++) r++;
        this.minimize(r), t = 0 == this.uncheckedNodes.length ? this.root : this.uncheckedNodes[this.uncheckedNodes.length - 1].child;
        for (i = r; i < e.length; i++) {
            var n = new z.TokenSet,
                s = e[i];
            t.edges[s] = n, this.uncheckedNodes.push({
                parent: t,
                char: s,
                child: n
            }), t = n
        }
        t.final = !0, this.previousWord = e
    }, z.TokenSet.Builder.prototype.finish = function() {
        this.minimize(0)
    }, z.TokenSet.Builder.prototype.minimize = function(e) {
        for (var t = this.uncheckedNodes.length - 1; e <= t; t--) {
            var r = this.uncheckedNodes[t],
                i = r.child.toString();
            i in this.minimizedNodes ? r.parent.edges[r.char] = this.minimizedNodes[i] : (r.child._str = i, this.minimizedNodes[i] = r.child), this.uncheckedNodes.pop()
        }
    }, z.Index = function(e) {
        this.invertedIndex = e.invertedIndex, this.fieldVectors = e.fieldVectors, this.tokenSet = e.tokenSet, this.fields = e.fields, this.pipeline = e.pipeline
    }, z.Index.prototype.search = function(t) {
        return this.query(function(e) {
            new z.QueryParser(t, e).parse()
        })
    }, z.Index.prototype.query = function(e) {
        for (var t = new z.Query(this.fields), r = Object.create(null), i = Object.create(null), n = Object.create(null), s = Object.create(null), o = Object.create(null), a = 0; a < this.fields.length; a++) i[this.fields[a]] = new z.Vector;
        e.call(t, t);
        for (a = 0; a < t.clauses.length; a++) {
            var u = t.clauses[a],
                l = null,
                c = z.Set.complete;
            l = u.usePipeline ? this.pipeline.runString(u.term, {
                fields: u.fields
            }) : [u.term];
            for (var h = 0; h < l.length; h++) {
                var d = l[h];
                u.term = d;
                var f = z.TokenSet.fromClause(u),
                    p = this.tokenSet.intersect(f).toArray();
                if (0 === p.length && u.presence === z.Query.presence.REQUIRED) {
                    for (var y = 0; y < u.fields.length; y++) {
                        s[R = u.fields[y]] = z.Set.empty
                    }
                    break
                }
                for (var m = 0; m < p.length; m++) {
                    var g = p[m],
                        x = this.invertedIndex[g],
                        v = x._index;
                    for (y = 0; y < u.fields.length; y++) {
                        var w = x[R = u.fields[y]],
                            Q = Object.keys(w),
                            k = g + "/" + R,
                            S = new z.Set(Q);
                        if (u.presence == z.Query.presence.REQUIRED && (c = c.union(S), void 0 === s[R] && (s[R] = z.Set.complete)), u.presence != z.Query.presence.PROHIBITED) {
                            if (i[R].upsert(v, u.boost, function(e, t) {
                                    return e + t
                                }), !n[k]) {
                                for (var E = 0; E < Q.length; E++) {
                                    var L, b = Q[E],
                                        P = new z.FieldRef(b, R),
                                        T = w[b];
                                    void 0 === (L = r[P]) ? r[P] = new z.MatchData(g, R, T) : L.add(g, R, T)
                                }
                                n[k] = !0
                            }
                        } else void 0 === o[R] && (o[R] = z.Set.empty), o[R] = o[R].union(S)
                    }
                }
            }
            if (u.presence === z.Query.presence.REQUIRED)
                for (y = 0; y < u.fields.length; y++) {
                    s[R = u.fields[y]] = s[R].intersect(c)
                }
        }
        var O = z.Set.complete,
            I = z.Set.empty;
        for (a = 0; a < this.fields.length; a++) {
            var R;
            s[R = this.fields[a]] && (O = O.intersect(s[R])), o[R] && (I = I.union(o[R]))
        }
        var F = Object.keys(r),
            C = [],
            N = Object.create(null);
        if (t.isNegated()) {
            F = Object.keys(this.fieldVectors);
            for (a = 0; a < F.length; a++) {
                P = F[a];
                var j = z.FieldRef.fromString(P);
                r[P] = new z.MatchData
            }
        }
        for (a = 0; a < F.length; a++) {
            var _ = (j = z.FieldRef.fromString(F[a])).docRef;
            if (O.contains(_) && !I.contains(_)) {
                var D, A = this.fieldVectors[j],
                    B = i[j.fieldName].similarity(A);
                if (void 0 !== (D = N[_])) D.score += B, D.matchData.combine(r[j]);
                else {
                    var V = {
                        ref: _,
                        score: B,
                        matchData: r[j]
                    };
                    N[_] = V, C.push(V)
                }
            }
        }
        return C.sort(function(e, t) {
            return t.score - e.score
        })
    }, z.Index.prototype.toJSON = function() {
        var e = Object.keys(this.invertedIndex).sort().map(function(e) {
                return [e, this.invertedIndex[e]]
            }, this),
            t = Object.keys(this.fieldVectors).map(function(e) {
                return [e, this.fieldVectors[e].toJSON()]
            }, this);
        return {
            version: z.version,
            fields: this.fields,
            fieldVectors: t,
            invertedIndex: e,
            pipeline: this.pipeline.toJSON()
        }
    }, z.Index.load = function(e) {
        var t = {},
            r = {},
            i = e.fieldVectors,
            n = Object.create(null),
            s = e.invertedIndex,
            o = new z.TokenSet.Builder,
            a = z.Pipeline.load(e.pipeline);
        e.version != z.version && z.utils.warn("Version mismatch when loading serialised index. Current version of lunr '" + z.version + "' does not match serialized index '" + e.version + "'");
        for (var u = 0; u < i.length; u++) {
            var l = (h = i[u])[0],
                c = h[1];
            r[l] = new z.Vector(c)
        }
        for (u = 0; u < s.length; u++) {
            var h, d = (h = s[u])[0],
                f = h[1];
            o.insert(d), n[d] = f
        }
        return o.finish(), t.fields = e.fields, t.fieldVectors = r, t.invertedIndex = n, t.tokenSet = o.root, t.pipeline = a, new z.Index(t)
    }, z.Builder = function() {
        this._ref = "id", this._fields = Object.create(null), this._documents = Object.create(null), this.invertedIndex = Object.create(null), this.fieldTermFrequencies = {}, this.fieldLengths = {}, this.tokenizer = z.tokenizer, this.pipeline = new z.Pipeline, this.searchPipeline = new z.Pipeline, this.documentCount = 0, this._b = .75, this._k1 = 1.2, this.termIndex = 0, this.metadataWhitelist = []
    }, z.Builder.prototype.ref = function(e) {
        this._ref = e
    }, z.Builder.prototype.field = function(e, t) {
        if (/\//.test(e)) throw new RangeError("Field '" + e + "' contains illegal character '/'");
        this._fields[e] = t || {}
    }, z.Builder.prototype.b = function(e) {
        this._b = e < 0 ? 0 : 1 < e ? 1 : e
    }, z.Builder.prototype.k1 = function(e) {
        this._k1 = e
    }, z.Builder.prototype.add = function(e, t) {
        var r = e[this._ref],
            i = Object.keys(this._fields);
        this._documents[r] = t || {}, this.documentCount += 1;
        for (var n = 0; n < i.length; n++) {
            var s = i[n],
                o = this._fields[s].extractor,
                a = o ? o(e) : e[s],
                u = this.tokenizer(a, {
                    fields: [s]
                }),
                l = this.pipeline.run(u),
                c = new z.FieldRef(r, s),
                h = Object.create(null);
            this.fieldTermFrequencies[c] = h, this.fieldLengths[c] = 0, this.fieldLengths[c] += l.length;
            for (var d = 0; d < l.length; d++) {
                var f = l[d];
                if (null == h[f] && (h[f] = 0), h[f] += 1, null == this.invertedIndex[f]) {
                    var p = Object.create(null);
                    p._index = this.termIndex, this.termIndex += 1;
                    for (var y = 0; y < i.length; y++) p[i[y]] = Object.create(null);
                    this.invertedIndex[f] = p
                }
                null == this.invertedIndex[f][s][r] && (this.invertedIndex[f][s][r] = Object.create(null));
                for (var m = 0; m < this.metadataWhitelist.length; m++) {
                    var g = this.metadataWhitelist[m],
                        x = f.metadata[g];
                    null == this.invertedIndex[f][s][r][g] && (this.invertedIndex[f][s][r][g] = []), this.invertedIndex[f][s][r][g].push(x)
                }
            }
        }
    }, z.Builder.prototype.calculateAverageFieldLengths = function() {
        for (var e = Object.keys(this.fieldLengths), t = e.length, r = {}, i = {}, n = 0; n < t; n++) {
            var s = z.FieldRef.fromString(e[n]),
                o = s.fieldName;
            i[o] || (i[o] = 0), i[o] += 1, r[o] || (r[o] = 0), r[o] += this.fieldLengths[s]
        }
        var a = Object.keys(this._fields);
        for (n = 0; n < a.length; n++) {
            var u = a[n];
            r[u] = r[u] / i[u]
        }
        this.averageFieldLength = r
    }, z.Builder.prototype.createFieldVectors = function() {
        for (var e = {}, t = Object.keys(this.fieldTermFrequencies), r = t.length, i = Object.create(null), n = 0; n < r; n++) {
            for (var s = z.FieldRef.fromString(t[n]), o = s.fieldName, a = this.fieldLengths[s], u = new z.Vector, l = this.fieldTermFrequencies[s], c = Object.keys(l), h = c.length, d = this._fields[o].boost || 1, f = this._documents[s.docRef].boost || 1, p = 0; p < h; p++) {
                var y, m, g, x = c[p],
                    v = l[x],
                    w = this.invertedIndex[x]._index;
                void 0 === i[x] ? (y = z.idf(this.invertedIndex[x], this.documentCount), i[x] = y) : y = i[x], m = y * ((this._k1 + 1) * v) / (this._k1 * (1 - this._b + this._b * (a / this.averageFieldLength[o])) + v), m *= d, m *= f, g = Math.round(1e3 * m) / 1e3, u.insert(w, g)
            }
            e[s] = u
        }
        this.fieldVectors = e
    }, z.Builder.prototype.createTokenSet = function() {
        this.tokenSet = z.TokenSet.fromArray(Object.keys(this.invertedIndex).sort())
    }, z.Builder.prototype.build = function() {
        return this.calculateAverageFieldLengths(), this.createFieldVectors(), this.createTokenSet(), new z.Index({
            invertedIndex: this.invertedIndex,
            fieldVectors: this.fieldVectors,
            tokenSet: this.tokenSet,
            fields: Object.keys(this._fields),
            pipeline: this.searchPipeline
        })
    }, z.Builder.prototype.use = function(e) {
        var t = Array.prototype.slice.call(arguments, 1);
        t.unshift(this), e.apply(this, t)
    }, z.MatchData = function(e, t, r) {
        for (var i = Object.create(null), n = Object.keys(r || {}), s = 0; s < n.length; s++) {
            var o = n[s];
            i[o] = r[o].slice()
        }
        this.metadata = Object.create(null), void 0 !== e && (this.metadata[e] = Object.create(null), this.metadata[e][t] = i)
    }, z.MatchData.prototype.combine = function(e) {
        for (var t = Object.keys(e.metadata), r = 0; r < t.length; r++) {
            var i = t[r],
                n = Object.keys(e.metadata[i]);
            null == this.metadata[i] && (this.metadata[i] = Object.create(null));
            for (var s = 0; s < n.length; s++) {
                var o = n[s],
                    a = Object.keys(e.metadata[i][o]);
                null == this.metadata[i][o] && (this.metadata[i][o] = Object.create(null));
                for (var u = 0; u < a.length; u++) {
                    var l = a[u];
                    null == this.metadata[i][o][l] ? this.metadata[i][o][l] = e.metadata[i][o][l] : this.metadata[i][o][l] = this.metadata[i][o][l].concat(e.metadata[i][o][l])
                }
            }
        }
    }, z.MatchData.prototype.add = function(e, t, r) {
        if (!(e in this.metadata)) return this.metadata[e] = Object.create(null), void(this.metadata[e][t] = r);
        if (t in this.metadata[e])
            for (var i = Object.keys(r), n = 0; n < i.length; n++) {
                var s = i[n];
                s in this.metadata[e][t] ? this.metadata[e][t][s] = this.metadata[e][t][s].concat(r[s]) : this.metadata[e][t][s] = r[s]
            } else this.metadata[e][t] = r
    }, z.Query = function(e) {
        this.clauses = [], this.allFields = e
    }, z.Query.wildcard = new String("*"), z.Query.wildcard.NONE = 0, z.Query.wildcard.LEADING = 1, z.Query.wildcard.TRAILING = 2, z.Query.presence = {
        OPTIONAL: 1,
        REQUIRED: 2,
        PROHIBITED: 3
    }, z.Query.prototype.clause = function(e) {
        return "fields" in e || (e.fields = this.allFields), "boost" in e || (e.boost = 1), "usePipeline" in e || (e.usePipeline = !0), "wildcard" in e || (e.wildcard = z.Query.wildcard.NONE), e.wildcard & z.Query.wildcard.LEADING && e.term.charAt(0) != z.Query.wildcard && (e.term = "*" + e.term), e.wildcard & z.Query.wildcard.TRAILING && e.term.slice(-1) != z.Query.wildcard && (e.term = e.term + "*"), "presence" in e || (e.presence = z.Query.presence.OPTIONAL), this.clauses.push(e), this
    }, z.Query.prototype.isNegated = function() {
        for (var e = 0; e < this.clauses.length; e++)
            if (this.clauses[e].presence != z.Query.presence.PROHIBITED) return !1;
        return !0
    }, z.Query.prototype.term = function(e, t) {
        if (Array.isArray(e)) return e.forEach(function(e) {
            this.term(e, z.utils.clone(t))
        }, this), this;
        var r = t || {};
        return r.term = e.toString(), this.clause(r), this
    }, z.QueryParseError = function(e, t, r) {
        this.name = "QueryParseError", this.message = e, this.start = t, this.end = r
    }, z.QueryParseError.prototype = new Error, z.QueryLexer = function(e) {
        this.lexemes = [], this.str = e, this.length = e.length, this.pos = 0, this.start = 0, this.escapeCharPositions = []
    }, z.QueryLexer.prototype.run = function() {
        for (var e = z.QueryLexer.lexText; e;) e = e(this)
    }, z.QueryLexer.prototype.sliceString = function() {
        for (var e = [], t = this.start, r = this.pos, i = 0; i < this.escapeCharPositions.length; i++) r = this.escapeCharPositions[i], e.push(this.str.slice(t, r)), t = r + 1;
        return e.push(this.str.slice(t, this.pos)), this.escapeCharPositions.length = 0, e.join("")
    }, z.QueryLexer.prototype.emit = function(e) {
        this.lexemes.push({
            type: e,
            str: this.sliceString(),
            start: this.start,
            end: this.pos
        }), this.start = this.pos
    }, z.QueryLexer.prototype.escapeCharacter = function() {
        this.escapeCharPositions.push(this.pos - 1), this.pos += 1
    }, z.QueryLexer.prototype.next = function() {
        if (this.pos >= this.length) return z.QueryLexer.EOS;
        var e = this.str.charAt(this.pos);
        return this.pos += 1, e
    }, z.QueryLexer.prototype.width = function() {
        return this.pos - this.start
    }, z.QueryLexer.prototype.ignore = function() {
        this.start == this.pos && (this.pos += 1), this.start = this.pos
    }, z.QueryLexer.prototype.backup = function() {
        this.pos -= 1
    }, z.QueryLexer.prototype.acceptDigitRun = function() {
        for (var e, t; 47 < (t = (e = this.next()).charCodeAt(0)) && t < 58;);
        e != z.QueryLexer.EOS && this.backup()
    }, z.QueryLexer.prototype.more = function() {
        return this.pos < this.length
    }, z.QueryLexer.EOS = "EOS", z.QueryLexer.FIELD = "FIELD", z.QueryLexer.TERM = "TERM", z.QueryLexer.EDIT_DISTANCE = "EDIT_DISTANCE", z.QueryLexer.BOOST = "BOOST", z.QueryLexer.PRESENCE = "PRESENCE", z.QueryLexer.lexField = function(e) {
        return e.backup(), e.emit(z.QueryLexer.FIELD), e.ignore(), z.QueryLexer.lexText
    }, z.QueryLexer.lexTerm = function(e) {
        if (1 < e.width() && (e.backup(), e.emit(z.QueryLexer.TERM)), e.ignore(), e.more()) return z.QueryLexer.lexText
    }, z.QueryLexer.lexEditDistance = function(e) {
        return e.ignore(), e.acceptDigitRun(), e.emit(z.QueryLexer.EDIT_DISTANCE), z.QueryLexer.lexText
    }, z.QueryLexer.lexBoost = function(e) {
        return e.ignore(), e.acceptDigitRun(), e.emit(z.QueryLexer.BOOST), z.QueryLexer.lexText
    }, z.QueryLexer.lexEOS = function(e) {
        0 < e.width() && e.emit(z.QueryLexer.TERM)
    }, z.QueryLexer.termSeparator = z.tokenizer.separator, z.QueryLexer.lexText = function(e) {
        for (;;) {
            var t = e.next();
            if (t == z.QueryLexer.EOS) return z.QueryLexer.lexEOS;
            if (92 != t.charCodeAt(0)) {
                if (":" == t) return z.QueryLexer.lexField;
                if ("~" == t) return e.backup(), 0 < e.width() && e.emit(z.QueryLexer.TERM), z.QueryLexer.lexEditDistance;
                if ("^" == t) return e.backup(), 0 < e.width() && e.emit(z.QueryLexer.TERM), z.QueryLexer.lexBoost;
                if ("+" == t && 1 === e.width()) return e.emit(z.QueryLexer.PRESENCE), z.QueryLexer.lexText;
                if ("-" == t && 1 === e.width()) return e.emit(z.QueryLexer.PRESENCE), z.QueryLexer.lexText;
                if (t.match(z.QueryLexer.termSeparator)) return z.QueryLexer.lexTerm
            } else e.escapeCharacter()
        }
    }, z.QueryParser = function(e, t) {
        this.lexer = new z.QueryLexer(e), this.query = t, this.currentClause = {}, this.lexemeIdx = 0
    }, z.QueryParser.prototype.parse = function() {
        this.lexer.run(), this.lexemes = this.lexer.lexemes;
        for (var e = z.QueryParser.parseClause; e;) e = e(this);
        return this.query
    }, z.QueryParser.prototype.peekLexeme = function() {
        return this.lexemes[this.lexemeIdx]
    }, z.QueryParser.prototype.consumeLexeme = function() {
        var e = this.peekLexeme();
        return this.lexemeIdx += 1, e
    }, z.QueryParser.prototype.nextClause = function() {
        var e = this.currentClause;
        this.query.clause(e), this.currentClause = {}
    }, z.QueryParser.parseClause = function(e) {
        var t = e.peekLexeme();
        if (null != t) switch (t.type) {
            case z.QueryLexer.PRESENCE:
                return z.QueryParser.parsePresence;
            case z.QueryLexer.FIELD:
                return z.QueryParser.parseField;
            case z.QueryLexer.TERM:
                return z.QueryParser.parseTerm;
            default:
                var r = "expected either a field or a term, found " + t.type;
                throw 1 <= t.str.length && (r += " with value '" + t.str + "'"), new z.QueryParseError(r, t.start, t.end)
        }
    }, z.QueryParser.parsePresence = function(e) {
        var t = e.consumeLexeme();
        if (null != t) {
            switch (t.str) {
                case "-":
                    e.currentClause.presence = z.Query.presence.PROHIBITED;
                    break;
                case "+":
                    e.currentClause.presence = z.Query.presence.REQUIRED;
                    break;
                default:
                    var r = "unrecognised presence operator'" + t.str + "'";
                    throw new z.QueryParseError(r, t.start, t.end)
            }
            var i = e.peekLexeme();
            if (null == i) {
                r = "expecting term or field, found nothing";
                throw new z.QueryParseError(r, t.start, t.end)
            }
            switch (i.type) {
                case z.QueryLexer.FIELD:
                    return z.QueryParser.parseField;
                case z.QueryLexer.TERM:
                    return z.QueryParser.parseTerm;
                default:
                    r = "expecting term or field, found '" + i.type + "'";
                    throw new z.QueryParseError(r, i.start, i.end)
            }
        }
    }, z.QueryParser.parseField = function(e) {
        var t = e.consumeLexeme();
        if (null != t) {
            if (-1 == e.query.allFields.indexOf(t.str)) {
                var r = e.query.allFields.map(function(e) {
                        return "'" + e + "'"
                    }).join(", "),
                    i = "unrecognised field '" + t.str + "', possible fields: " + r;
                throw new z.QueryParseError(i, t.start, t.end)
            }
            e.currentClause.fields = [t.str];
            var n = e.peekLexeme();
            if (null == n) {
                i = "expecting term, found nothing";
                throw new z.QueryParseError(i, t.start, t.end)
            }
            switch (n.type) {
                case z.QueryLexer.TERM:
                    return z.QueryParser.parseTerm;
                default:
                    i = "expecting term, found '" + n.type + "'";
                    throw new z.QueryParseError(i, n.start, n.end)
            }
        }
    }, z.QueryParser.parseTerm = function(e) {
        var t = e.consumeLexeme();
        if (null != t) {
            e.currentClause.term = t.str.toLowerCase(), -1 != t.str.indexOf("*") && (e.currentClause.usePipeline = !1);
            var r = e.peekLexeme();
            if (null != r) switch (r.type) {
                case z.QueryLexer.TERM:
                    return e.nextClause(), z.QueryParser.parseTerm;
                case z.QueryLexer.FIELD:
                    return e.nextClause(), z.QueryParser.parseField;
                case z.QueryLexer.EDIT_DISTANCE:
                    return z.QueryParser.parseEditDistance;
                case z.QueryLexer.BOOST:
                    return z.QueryParser.parseBoost;
                case z.QueryLexer.PRESENCE:
                    return e.nextClause(), z.QueryParser.parsePresence;
                default:
                    var i = "Unexpected lexeme type '" + r.type + "'";
                    throw new z.QueryParseError(i, r.start, r.end)
            } else e.nextClause()
        }
    }, z.QueryParser.parseEditDistance = function(e) {
        var t = e.consumeLexeme();
        if (null != t) {
            var r = parseInt(t.str, 10);
            if (isNaN(r)) {
                var i = "edit distance must be numeric";
                throw new z.QueryParseError(i, t.start, t.end)
            }
            e.currentClause.editDistance = r;
            var n = e.peekLexeme();
            if (null != n) switch (n.type) {
                case z.QueryLexer.TERM:
                    return e.nextClause(), z.QueryParser.parseTerm;
                case z.QueryLexer.FIELD:
                    return e.nextClause(), z.QueryParser.parseField;
                case z.QueryLexer.EDIT_DISTANCE:
                    return z.QueryParser.parseEditDistance;
                case z.QueryLexer.BOOST:
                    return z.QueryParser.parseBoost;
                case z.QueryLexer.PRESENCE:
                    return e.nextClause(), z.QueryParser.parsePresence;
                default:
                    i = "Unexpected lexeme type '" + n.type + "'";
                    throw new z.QueryParseError(i, n.start, n.end)
            } else e.nextClause()
        }
    }, z.QueryParser.parseBoost = function(e) {
        var t = e.consumeLexeme();
        if (null != t) {
            var r = parseInt(t.str, 10);
            if (isNaN(r)) {
                var i = "boost must be numeric";
                throw new z.QueryParseError(i, t.start, t.end)
            }
            e.currentClause.boost = r;
            var n = e.peekLexeme();
            if (null != n) switch (n.type) {
                case z.QueryLexer.TERM:
                    return e.nextClause(), z.QueryParser.parseTerm;
                case z.QueryLexer.FIELD:
                    return e.nextClause(), z.QueryParser.parseField;
                case z.QueryLexer.EDIT_DISTANCE:
                    return z.QueryParser.parseEditDistance;
                case z.QueryLexer.BOOST:
                    return z.QueryParser.parseBoost;
                case z.QueryLexer.PRESENCE:
                    return e.nextClause(), z.QueryParser.parsePresence;
                default:
                    i = "Unexpected lexeme type '" + n.type + "'";
                    throw new z.QueryParseError(i, n.start, n.end)
            } else e.nextClause()
        }
    }, n = this, s = function() {
        return z
    }, "function" == typeof define && define.amd ? define(s) : "object" == typeof exports ? module.exports = s() : n.lunr = s()
}();