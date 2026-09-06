/* ============================================================
   El Camino al Lombardi — lógica principal
   Progreso de scroll, navegación, animaciones, trivia, línea de
   tiempo de campeones y tabla de franquicias más ganadoras.
   (El visor 3D del trofeo vive aparte, en trophy.js)
   ============================================================ */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll progress bar ---------- */
  var progressFill = document.getElementById("progressFill");
  function updateProgress(){
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    progressFill.style.width = pct + "%";
  }
  document.addEventListener("scroll", updateProgress, {passive:true});
  updateProgress();

  /* ---------- Rail nav: active state + smooth scroll ---------- */
  var railItems = Array.prototype.slice.call(document.querySelectorAll(".rail-item"));
  var sections = railItems.map(function(item){
    return document.getElementById(item.getAttribute("data-target"));
  });
  railItems.forEach(function(item){
    item.addEventListener("click", function(){
      var target = document.getElementById(item.getAttribute("data-target"));
      if(target) target.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block:"start"});
    });
  });
  var railObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var idx = sections.indexOf(entry.target);
      if(idx === -1) return;
      if(entry.isIntersecting){
        railItems.forEach(function(i){ i.classList.remove("active"); });
        railItems[idx].classList.add("active");
      }
    });
  }, {rootMargin:"-50% 0px -50% 0px", threshold:0});
  sections.forEach(function(s){ if(s) railObserver.observe(s); });

  /* ---------- Count-up numbers on reveal ---------- */
  function animateCount(el){
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if(reduceMotion){ el.textContent = prefix + target + suffix; return; }
    var duration = 1100, start = null;
    function step(ts){
      if(start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting && !entry.target.dataset.animated){
        entry.target.dataset.animated = "1";
        animateCount(entry.target);
      }
    });
  }, {threshold:0.6});
  document.querySelectorAll("[data-count]").forEach(function(el){ countObserver.observe(el); });

  /* ---------- Kickoff return play animation ---------- */
  var pathEl = document.getElementById("returnPath");
  var ballEl = document.getElementById("ballMarker");
  var playBtn = document.getElementById("playPlay");
  var pathLen = pathEl.getTotalLength();
  var playing = false;
  function resetBall(){
    var p = pathEl.getPointAtLength(0);
    ballEl.setAttribute("cx", p.x); ballEl.setAttribute("cy", p.y);
  }
  resetBall();
  playBtn.addEventListener("click", function(){
    if(playing) return;
    playing = true;
    playBtn.textContent = "Anotación ✓";
    if(reduceMotion){
      var end = pathEl.getPointAtLength(pathLen);
      ballEl.setAttribute("cx", end.x); ballEl.setAttribute("cy", end.y);
      setTimeout(function(){ playing=false; playBtn.textContent="Ver la jugada legendaria"; resetBall(); }, 1200);
      return;
    }
    var duration = 2200, start = null;
    function step(ts){
      if(start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var pt = pathEl.getPointAtLength(p * pathLen);
      ballEl.setAttribute("cx", pt.x); ballEl.setAttribute("cy", pt.y);
      if(p < 1) requestAnimationFrame(step);
      else {
        setTimeout(function(){
          playing = false; playBtn.textContent = "Ver la jugada legendaria"; resetBall();
        }, 900);
      }
    }
    requestAnimationFrame(step);
  });

  /* ---------- Trivia quiz ---------- */
  var quizData = [
    {
      q: "¿Ante qué equipo perdió Seattle el Súper Tazón XLIX en 2015?",
      opts: ["Denver Broncos", "New England Patriots", "Pittsburgh Steelers", "Baltimore Ravens"],
      correct: 1,
      explain: "Los Patriots ganaron XLIX 28–24 tras una intercepción en la línea de una yarda — la misma franquicia con la que Seattle se reencontró en el Súper Tazón LX."
    },
    {
      q: "¿Cuántos Súper Tazones ha ganado Tom Brady como jugador?",
      opts: ["5", "6", "7", "8"],
      correct: 2,
      explain: "Siete anillos — más que cualquier franquicia individual de la NFL."
    },
    {
      q: "¿De qué material está hecho el Trofeo Vince Lombardi?",
      opts: ["Oro de 24 quilates", "Bronce pulido", "Plata esterlina", "Cristal tallado"],
      correct: 2,
      explain: "Es de plata esterlina maciza, fabricado por Tiffany & Co., y pesa cerca de 7 libras."
    },
    {
      q: "¿Quién fabrica un trofeo nuevo cada año para el campeón?",
      opts: ["Cartier", "Tiffany & Co.", "De Beers", "Gucci"],
      correct: 1,
      explain: "A diferencia de la Copa Stanley, el Lombardi no se reutiliza: Tiffany & Co. crea uno nuevo cada temporada."
    },
    {
      q: "¿Quién fue nombrado MVP del Súper Tazón LX?",
      opts: ["Sam Darnold", "Jaxon Smith-Njigba", "Kenneth Walker III", "DK Metcalf"],
      correct: 2,
      explain: "Kenneth Walker III se llevó el MVP en la victoria 29–13 sobre los Patriots."
    },
    {
      q: "¿En qué año nació la liga que hoy conocemos como la NFL?",
      opts: ["1910", "1920", "1932", "1946"],
      correct: 1,
      explain: "Se fundó en 1920 como la American Professional Football Association; adoptó el nombre National Football League en 1922."
    },
    {
      q: "¿Qué equipo protagonizó la única temporada perfecta de la era moderna, invicto incluyendo playoffs?",
      opts: ["Chicago Bears 1985", "New England Patriots 2007", "Miami Dolphins 1972", "Pittsburgh Steelers 1976"],
      correct: 2,
      explain: "Los Miami Dolphins de 1972 terminaron 17–0, coronando la temporada con el Súper Tazón VII. Nadie más lo ha logrado."
    },
    {
      q: "¿En qué temporada se completó la fusión entre la NFL y la AFL en una sola liga?",
      opts: ["1966", "1970", "1978", "1985"],
      correct: 1,
      explain: "El acuerdo se firmó en 1966 y se jugó el primer Súper Tazón en 1967, pero la fusión completa —con una sola tabla de posiciones— llegó hasta la temporada de 1970."
    },
    {
      q: "¿Quién tiene el récord histórico de más yardas terrestres en una carrera de la NFL?",
      opts: ["Walter Payton", "Barry Sanders", "Emmitt Smith", "Frank Gore"],
      correct: 2,
      explain: "Emmitt Smith acumuló 18,355 yardas por tierra en su carrera, la marca más alta de la historia."
    },
    {
      q: "¿Quién tiene, hasta 2026, el gol de campo más largo en la historia de la NFL?",
      opts: ["Justin Tucker (66 yardas)", "Cam Little (68 yardas)", "Matt Prater (64 yardas)", "Tom Dempsey (63 yardas)"],
      correct: 1,
      explain: "Cam Little, de los Jacksonville Jaguars, pateó 68 yardas en noviembre de 2025, superando el histórico de 66 yardas de Justin Tucker."
    },
    {
      q: "¿Cómo se conoce la jugada de Franco Harris en los playoffs de 1972 ante los Raiders, una de las más famosas de la historia de la NFL?",
      opts: ["The Catch", "The Hail Mary", "The Immaculate Reception", "The Fumble"],
      correct: 2,
      explain: "\"La Recepción Inmaculada\": un pase rebotado que Harris atrapó casi a ras de piso para anotar el touchdown de la victoria."
    },
    {
      q: "¿Qué receptor tiene el récord histórico de más yardas de recepción en una carrera de la NFL?",
      opts: ["Randy Moss", "Terrell Owens", "Larry Fitzgerald", "Jerry Rice"],
      correct: 3,
      explain: "Jerry Rice acumuló 22,895 yardas de recepción, además de 197 touchdowns — ambos récords históricos, y por un margen amplio."
    },
    {
      q: "¿Cuántos anillos de Súper Tazón ha ganado Bill Belichick como entrenador — más que cualquier jugador o franquicia por sí sola?",
      opts: ["6", "7", "8", "9"],
      correct: 2,
      explain: "Ocho anillos como entrenador, uno más que los siete que ganó Tom Brady como jugador."
    }
  ];
  var qIndex = 0, qScore = 0;
  document.getElementById("quizTotal").textContent = quizData.length;
  var quizQuestion = document.getElementById("quizQuestion");
  var quizOpts = document.getElementById("quizOpts");
  var quizExplain = document.getElementById("quizExplain");
  var quizProgress = document.getElementById("quizProgress");
  var quizScoreEl = document.getElementById("quizScore");
  var quizNext = document.getElementById("quizNext");

  function renderQuiz(){
    var item = quizData[qIndex];
    quizProgress.textContent = "Pregunta " + (qIndex+1) + " de " + quizData.length;
    quizQuestion.textContent = item.q;
    quizExplain.classList.remove("show");
    quizExplain.textContent = "";
    quizNext.hidden = true;
    quizOpts.innerHTML = "";
    item.opts.forEach(function(opt, i){
      var b = document.createElement("button");
      b.className = "quiz-opt";
      b.textContent = opt;
      b.addEventListener("click", function(){ answerQuiz(i); });
      quizOpts.appendChild(b);
    });
  }
  function answerQuiz(i){
    var item = quizData[qIndex];
    var btns = Array.prototype.slice.call(quizOpts.children);
    btns.forEach(function(b, idx){
      b.disabled = true;
      if(idx === item.correct) b.classList.add("correct");
      else if(idx === i) b.classList.add("wrong");
    });
    if(i === item.correct){ qScore++; quizScoreEl.textContent = qScore; }
    quizExplain.textContent = item.explain;
    quizExplain.classList.add("show");
    if(qIndex < quizData.length - 1) quizNext.hidden = false;
    else {
      quizNext.hidden = false;
      quizNext.textContent = "Ver resultado";
      quizNext.onclick = function(){
        quizQuestion.textContent = "¡Terminaste! Acertaste " + qScore + " de " + quizData.length + ".";
        quizOpts.innerHTML = "";
        quizExplain.classList.remove("show");
        quizNext.hidden = true;
        quizProgress.textContent = "Trivia completa";
      };
      return;
    }
  }
  quizNext.addEventListener("click", function(){
    if(qIndex < quizData.length - 1){ qIndex++; renderQuiz(); }
  });
  renderQuiz();

  /* ---------- Confetti helper (used when browsing champions) ---------- */
  function fireConfetti(colors){
    if(typeof confetti !== "function" || reduceMotion) return;
    confetti({particleCount:36,startVelocity:32,spread:65,ticks:140,origin:{x:0.5,y:0.35},colors:colors});
  }

  /* ---------- Team crests (original color badges, not official logos) ---------- */
  var CREST = {
    "Green Bay Packers":{a:"GB",c1:"#203731",c2:"#FFB612"},
    "Kansas City Chiefs":{a:"KC",c1:"#E31837",c2:"#FFB81C"},
    "New York Jets":{a:"NYJ",c1:"#125740",c2:"#FFFFFF"},
    "Baltimore Colts":{a:"BAL",c1:"#003087",c2:"#FFFFFF"},
    "Indianapolis Colts":{a:"IND",c1:"#002C5F",c2:"#A5ACAF"},
    "Dallas Cowboys":{a:"DAL",c1:"#041E42",c2:"#869397"},
    "Miami Dolphins":{a:"MIA",c1:"#008E97",c2:"#FC4C02"},
    "Washington":{a:"WSH",c1:"#5A1414",c2:"#FFB612"},
    "Pittsburgh Steelers":{a:"PIT",c1:"#101820",c2:"#FFB612"},
    "Minnesota Vikings":{a:"MIN",c1:"#4F2683",c2:"#FFC62F"},
    "Oakland Raiders":{a:"OAK",c1:"#000000",c2:"#A5ACAF"},
    "Los Angeles Raiders":{a:"LAR",c1:"#000000",c2:"#A5ACAF"},
    "Las Vegas Raiders":{a:"LV",c1:"#000000",c2:"#A5ACAF"},
    "Denver Broncos":{a:"DEN",c1:"#FB4F14",c2:"#002244"},
    "San Francisco 49ers":{a:"SF",c1:"#AA0000",c2:"#B3995D"},
    "Chicago Bears":{a:"CHI",c1:"#0B162A",c2:"#C83803"},
    "New York Giants":{a:"NYG",c1:"#0B2265",c2:"#A71930"},
    "Cincinnati Bengals":{a:"CIN",c1:"#FB4F14",c2:"#000000"},
    "Buffalo Bills":{a:"BUF",c1:"#00338D",c2:"#C60C30"},
    "New England Patriots":{a:"NE",c1:"#002244",c2:"#C60C30"},
    "Los Angeles Rams":{a:"LAR",c1:"#003594",c2:"#FFA300"},
    "St. Louis Rams":{a:"STL",c1:"#003594",c2:"#FFA300"},
    "San Diego Chargers":{a:"SD",c1:"#0080C6",c2:"#FFC20E"},
    "Tampa Bay Buccaneers":{a:"TB",c1:"#D50A0A",c2:"#34302B"},
    "Philadelphia Eagles":{a:"PHI",c1:"#004C54",c2:"#A5ACAF"},
    "Baltimore Ravens":{a:"RAV",c1:"#241773",c2:"#9E7C0C"},
    "Arizona Cardinals":{a:"ARI",c1:"#97233F",c2:"#000000"},
    "New Orleans Saints":{a:"NO",c1:"#101820",c2:"#D3BC8D"},
    "Carolina Panthers":{a:"CAR",c1:"#0085CA",c2:"#101820"},
    "Atlanta Falcons":{a:"ATL",c1:"#A71930",c2:"#000000"},
    "Tennessee Titans":{a:"TEN",c1:"#0C2340",c2:"#4B92DB"},
    "Seattle Seahawks":{a:"SEA",c1:"#69BE28",c2:"#002244"}
  };
  function crestHTML(team){
    var t = CREST[team] || {a:team.slice(0,3).toUpperCase(), c1:"#3a4258", c2:"#8a93a8"};
    return "<span class='crest' style='background:linear-gradient(150deg," + t.c1 + "," + t.c2 + ")' aria-hidden='true'>" + t.a + "</span>";
  }
  function crestColors(team){
    var t = CREST[team] || {c1:"#D50A0A", c2:"#d7dee6"};
    return [t.c1, t.c2, "#f4f0e6"];
  }

  /* ---------- Champions timeline ---------- */
  var champions = [
    {sb:"I", year:1967, winner:"Green Bay Packers", loser:"Kansas City Chiefs", score:"35–10", mvp:"Bart Starr, QB (Packers)"},
    {sb:"II", year:1968, winner:"Green Bay Packers", loser:"Oakland Raiders", score:"33–14", mvp:"Bart Starr, QB (Packers)"},
    {sb:"III", year:1969, winner:"New York Jets", loser:"Baltimore Colts", score:"16–7", mvp:"Joe Namath, QB (Jets)"},
    {sb:"IV", year:1970, winner:"Kansas City Chiefs", loser:"Minnesota Vikings", score:"23–7", mvp:"Len Dawson, QB (Chiefs)"},
    {sb:"V", year:1971, winner:"Baltimore Colts", loser:"Dallas Cowboys", score:"16–13", mvp:"Chuck Howley, LB (Cowboys) — el único MVP de un equipo perdedor"},
    {sb:"VI", year:1972, winner:"Dallas Cowboys", loser:"Miami Dolphins", score:"24–3", mvp:"Roger Staubach, QB (Cowboys)"},
    {sb:"VII", year:1973, winner:"Miami Dolphins", loser:"Washington", score:"14–7", mvp:"Jake Scott, S (Dolphins) — temporada perfecta 17–0"},
    {sb:"VIII", year:1974, winner:"Miami Dolphins", loser:"Minnesota Vikings", score:"24–7", mvp:"Larry Csonka, RB (Dolphins)"},
    {sb:"IX", year:1975, winner:"Pittsburgh Steelers", loser:"Minnesota Vikings", score:"16–6", mvp:"Franco Harris, RB (Steelers)"},
    {sb:"X", year:1976, winner:"Pittsburgh Steelers", loser:"Dallas Cowboys", score:"21–17", mvp:"Lynn Swann, WR (Steelers)"},
    {sb:"XI", year:1977, winner:"Oakland Raiders", loser:"Minnesota Vikings", score:"32–14", mvp:"Fred Biletnikoff, WR (Raiders)"},
    {sb:"XII", year:1978, winner:"Dallas Cowboys", loser:"Denver Broncos", score:"27–10", mvp:"Harvey Martin y Randy White, DL (Cowboys) — MVP compartido"},
    {sb:"XIII", year:1979, winner:"Pittsburgh Steelers", loser:"Dallas Cowboys", score:"35–31", mvp:"Terry Bradshaw, QB (Steelers)"},
    {sb:"XIV", year:1980, winner:"Pittsburgh Steelers", loser:"Los Angeles Rams", score:"31–19", mvp:"Terry Bradshaw, QB (Steelers)"},
    {sb:"XV", year:1981, winner:"Oakland Raiders", loser:"Philadelphia Eagles", score:"27–10", mvp:"Jim Plunkett, QB (Raiders)"},
    {sb:"XVI", year:1982, winner:"San Francisco 49ers", loser:"Cincinnati Bengals", score:"26–21", mvp:"Joe Montana, QB (49ers)"},
    {sb:"XVII", year:1983, winner:"Washington", loser:"Miami Dolphins", score:"27–17", mvp:"John Riggins, RB (Washington)"},
    {sb:"XVIII", year:1984, winner:"Los Angeles Raiders", loser:"Washington", score:"38–9", mvp:"Marcus Allen, RB (Raiders)"},
    {sb:"XIX", year:1985, winner:"San Francisco 49ers", loser:"Miami Dolphins", score:"38–16", mvp:"Joe Montana, QB (49ers)"},
    {sb:"XX", year:1986, winner:"Chicago Bears", loser:"New England Patriots", score:"46–10", mvp:"Richard Dent, DE (Bears)"},
    {sb:"XXI", year:1987, winner:"New York Giants", loser:"Denver Broncos", score:"39–20", mvp:"Phil Simms, QB (Giants)"},
    {sb:"XXII", year:1988, winner:"Washington", loser:"Denver Broncos", score:"42–10", mvp:"Doug Williams, QB (Washington)"},
    {sb:"XXIII", year:1989, winner:"San Francisco 49ers", loser:"Cincinnati Bengals", score:"20–16", mvp:"Jerry Rice, WR (49ers)"},
    {sb:"XXIV", year:1990, winner:"San Francisco 49ers", loser:"Denver Broncos", score:"55–10", mvp:"Joe Montana, QB (49ers)"},
    {sb:"XXV", year:1991, winner:"New York Giants", loser:"Buffalo Bills", score:"20–19", mvp:"Ottis Anderson, RB (Giants)"},
    {sb:"XXVI", year:1992, winner:"Washington", loser:"Buffalo Bills", score:"37–24", mvp:"Mark Rypien, QB (Washington)"},
    {sb:"XXVII", year:1993, winner:"Dallas Cowboys", loser:"Buffalo Bills", score:"52–17", mvp:"Troy Aikman, QB (Cowboys)"},
    {sb:"XXVIII", year:1994, winner:"Dallas Cowboys", loser:"Buffalo Bills", score:"30–13", mvp:"Emmitt Smith, RB (Cowboys)"},
    {sb:"XXIX", year:1995, winner:"San Francisco 49ers", loser:"San Diego Chargers", score:"49–26", mvp:"Steve Young, QB (49ers)"},
    {sb:"XXX", year:1996, winner:"Dallas Cowboys", loser:"Pittsburgh Steelers", score:"27–17", mvp:"Larry Brown, CB (Cowboys)"},
    {sb:"XXXI", year:1997, winner:"Green Bay Packers", loser:"New England Patriots", score:"35–21", mvp:"Desmond Howard, KR (Packers)"},
    {sb:"XXXII", year:1998, winner:"Denver Broncos", loser:"Green Bay Packers", score:"31–24", mvp:"Terrell Davis, RB (Broncos)"},
    {sb:"XXXIII", year:1999, winner:"Denver Broncos", loser:"Atlanta Falcons", score:"34–19", mvp:"John Elway, QB (Broncos)"},
    {sb:"XXXIV", year:2000, winner:"St. Louis Rams", loser:"Tennessee Titans", score:"23–16", mvp:"Kurt Warner, QB (Rams)"},
    {sb:"XXXV", year:2001, winner:"Baltimore Ravens", loser:"New York Giants", score:"34–7", mvp:"Ray Lewis, LB (Ravens)"},
    {sb:"XXXVI", year:2002, winner:"New England Patriots", loser:"St. Louis Rams", score:"20–17", mvp:"Tom Brady, QB (Patriots)"},
    {sb:"XXXVII", year:2003, winner:"Tampa Bay Buccaneers", loser:"Oakland Raiders", score:"48–21", mvp:"Dexter Jackson, S (Buccaneers)"},
    {sb:"XXXVIII", year:2004, winner:"New England Patriots", loser:"Carolina Panthers", score:"32–29", mvp:"Tom Brady, QB (Patriots)"},
    {sb:"XXXIX", year:2005, winner:"New England Patriots", loser:"Philadelphia Eagles", score:"24–21", mvp:"Deion Branch, WR (Patriots)"},
    {sb:"XL", year:2006, winner:"Pittsburgh Steelers", loser:"Seattle Seahawks", score:"21–10", mvp:"Hines Ward, WR (Steelers)"},
    {sb:"XLI", year:2007, winner:"Indianapolis Colts", loser:"Chicago Bears", score:"29–17", mvp:"Peyton Manning, QB (Colts)"},
    {sb:"XLII", year:2008, winner:"New York Giants", loser:"New England Patriots", score:"17–14", mvp:"Eli Manning, QB (Giants)"},
    {sb:"XLIII", year:2009, winner:"Pittsburgh Steelers", loser:"Arizona Cardinals", score:"27–23", mvp:"Santonio Holmes, WR (Steelers)"},
    {sb:"XLIV", year:2010, winner:"New Orleans Saints", loser:"Indianapolis Colts", score:"31–17", mvp:"Drew Brees, QB (Saints)"},
    {sb:"XLV", year:2011, winner:"Green Bay Packers", loser:"Pittsburgh Steelers", score:"31–25", mvp:"Aaron Rodgers, QB (Packers)"},
    {sb:"XLVI", year:2012, winner:"New York Giants", loser:"New England Patriots", score:"21–17", mvp:"Eli Manning, QB (Giants)"},
    {sb:"XLVII", year:2013, winner:"Baltimore Ravens", loser:"San Francisco 49ers", score:"34–31", mvp:"Joe Flacco, QB (Ravens)"},
    {sb:"XLVIII", year:2014, winner:"Seattle Seahawks", loser:"Denver Broncos", score:"43–8", mvp:"Malcolm Smith, LB (Seahawks)"},
    {sb:"XLIX", year:2015, winner:"New England Patriots", loser:"Seattle Seahawks", score:"28–24", mvp:"Tom Brady, QB (Patriots)"},
    {sb:"L", year:2016, winner:"Denver Broncos", loser:"Carolina Panthers", score:"24–10", mvp:"Von Miller, LB (Broncos)"},
    {sb:"LI", year:2017, winner:"New England Patriots", loser:"Atlanta Falcons", score:"34–28", mvp:"Tom Brady, QB (Patriots)"},
    {sb:"LII", year:2018, winner:"Philadelphia Eagles", loser:"New England Patriots", score:"41–33", mvp:"Nick Foles, QB (Eagles)"},
    {sb:"LIII", year:2019, winner:"New England Patriots", loser:"Los Angeles Rams", score:"13–3", mvp:"Julian Edelman, WR (Patriots)"},
    {sb:"LIV", year:2020, winner:"Kansas City Chiefs", loser:"San Francisco 49ers", score:"31–20", mvp:"Patrick Mahomes, QB (Chiefs)"},
    {sb:"LV", year:2021, winner:"Tampa Bay Buccaneers", loser:"Kansas City Chiefs", score:"31–9", mvp:"Tom Brady, QB (Buccaneers)"},
    {sb:"LVI", year:2022, winner:"Los Angeles Rams", loser:"Cincinnati Bengals", score:"23–20", mvp:"Cooper Kupp, WR (Rams)"},
    {sb:"LVII", year:2023, winner:"Kansas City Chiefs", loser:"Philadelphia Eagles", score:"38–35", mvp:"Patrick Mahomes, QB (Chiefs)"},
    {sb:"LVIII", year:2024, winner:"Kansas City Chiefs", loser:"San Francisco 49ers", score:"25–22", mvp:"Patrick Mahomes, QB (Chiefs)"},
    {sb:"LIX", year:2025, winner:"Philadelphia Eagles", loser:"Kansas City Chiefs", score:"40–22", mvp:"Jalen Hurts, QB (Eagles)"},
    {sb:"LX", year:2026, winner:"Seattle Seahawks", loser:"New England Patriots", score:"29–13", mvp:"Kenneth Walker III, RB (Seahawks)"}
  ];
  var tlStrip = document.getElementById("timeline");
  var tlDetail = document.getElementById("tlDetail");
  champions.forEach(function(c, i){
    var chip = document.createElement("button");
    chip.className = "tl-chip";
    chip.setAttribute("role","option");
    chip.innerHTML = "<span class='tl-num'>" + c.sb + "</span><span class='tl-year'>" + c.year + "</span>";
    chip.addEventListener("click", function(){ selectChampion(i, true); });
    tlStrip.appendChild(chip);
  });
  function selectChampion(i, fromClick){
    var c = champions[i];
    Array.prototype.forEach.call(tlStrip.children, function(chip, idx){
      chip.classList.toggle("active", idx === i);
    });
    var activeChip = tlStrip.children[i];
    if(activeChip){
      var targetLeft = activeChip.offsetLeft - (tlStrip.clientWidth / 2) + (activeChip.clientWidth / 2);
      tlStrip.scrollLeft = Math.max(0, targetLeft);
    }
    tlDetail.innerHTML =
      "<div class='tl-detail-title'>Súper Tazón " + c.sb + " · " + c.year + "</div>" +
      "<div class='tl-detail-score'>" + crestHTML(c.winner) + "<span>" + c.winner + " " + c.score + " " + c.loser + "</span>" + crestHTML(c.loser) + "</div>" +
      "<div class='tl-detail-mvp'>Jugador clave (MVP): <strong>" + c.mvp + "</strong></div>";
    if(fromClick) fireConfetti(crestColors(c.winner));
  }
  selectChampion(champions.length - 1, false);

  /* ---------- Champions leaderboard (most titles, I–LX) ---------- */
  var champCounts = [
    {rank:1, team:"Pittsburgh Steelers", count:6},
    {rank:1, team:"New England Patriots", count:6},
    {rank:3, team:"Dallas Cowboys", count:5},
    {rank:3, team:"San Francisco 49ers", count:5},
    {rank:5, team:"Green Bay Packers", count:4},
    {rank:5, team:"New York Giants", count:4},
    {rank:5, team:"Kansas City Chiefs", count:4},
    {rank:8, team:"Las Vegas Raiders", count:3},
    {rank:8, team:"Washington", count:3},
    {rank:8, team:"Denver Broncos", count:3},
    {rank:11, team:"Miami Dolphins", count:2},
    {rank:11, team:"Indianapolis Colts", count:2},
    {rank:11, team:"Los Angeles Rams", count:2},
    {rank:11, team:"Baltimore Ravens", count:2},
    {rank:11, team:"Tampa Bay Buccaneers", count:2},
    {rank:11, team:"Seattle Seahawks", count:2},
    {rank:11, team:"Philadelphia Eagles", count:2},
    {rank:18, team:"New York Jets", count:1},
    {rank:18, team:"Chicago Bears", count:1},
    {rank:18, team:"New Orleans Saints", count:1}
  ];
  var champsBoard = document.getElementById("champsBoard");
  var maxCount = 6;
  champCounts.forEach(function(row){
    var el = document.createElement("div");
    el.className = "champs-row";
    el.innerHTML =
      "<span class='champs-rank'>" + row.rank + "</span>" +
      crestHTML(row.team) +
      "<span class='champs-name'>" + row.team + "</span>" +
      "<span class='champs-bar-track'><span class='champs-bar-fill' style='width:" + Math.round((row.count / maxCount) * 100) + "%'></span></span>" +
      "<span class='champs-count'>" + row.count + "</span>";
    champsBoard.appendChild(el);
  });

  /* ---------- Ambient stadium noise (synthesized, no audio file) ---------- */
  var ambientBtn = document.getElementById("ambientToggle");
  var ambientLabel = document.getElementById("ambientLabel");
  var audioCtx = null, noiseSource = null, filter = null, gainNode = null, ambientOn = false;
  function startAmbient(){
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var bufferSize = 2 * audioCtx.sampleRate;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    for(var i=0;i<bufferSize;i++){ data[i] = Math.random() * 2 - 1; }
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.6;
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    noiseSource.connect(filter).connect(gainNode).connect(audioCtx.destination);
    noiseSource.start();
    gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.6);
  }
  function stopAmbient(){
    if(!gainNode || !audioCtx) return;
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
    setTimeout(function(){ if(noiseSource){ try{noiseSource.stop();}catch(e){} noiseSource=null; } }, 500);
  }
  ambientBtn.addEventListener("click", function(){
    ambientOn = !ambientOn;
    ambientBtn.setAttribute("aria-pressed", String(ambientOn));
    ambientLabel.textContent = ambientOn ? "Sonido: activado" : "Sonido: estadio";
    if(ambientOn) startAmbient(); else stopAmbient();
  });
})();
