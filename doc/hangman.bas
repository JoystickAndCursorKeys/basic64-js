10 print "{clear}{white}hang{red}man{white}"
20 print "{0}" :print "creative computing"
21 print " morristown, new jersey"
22 print : print "adapter by cursor keys retro computing"
23 poke 53280, 0:poke 53281, 0: print "{white}"
25 print :print :print
30 dim p$ (12,12),l$ (20),d$ (20),n$ (26),u (50)
40 c = 1:n =50
50 for i = 1to 20:d$ (i )="-":next i :m = 0
60 for i = 1to 26:n$ (i )="":next i
70 for i = 1to 12:for j = 1to 12:p$ (i ,j )=" ":next j :next i
80 for i = 1to 12:p$ (i , 1)="{reverse on} {reverse off}":next i
90 for i = 1to  7:p$ ( 1,i )="{reverse on} {reverse off}":next :p$ ( 2, 7)="{reverse on} {reverse off}"
95 if c <n then 100
97 print "you did all the words!!":stop
100 q =int (n *rnd ( 1))+ 1
110 if u (q )= 1then 100
115 u (q )= 1:c =c + 1:restore :t1 = 0
150 for i = 1to q :read a$ :next i
160 l =len (a$ ):for i = 1to len (a$ ):l$ (i )=mid$ (a$ ,i , 1):next i
170 print "here are the letters you used:"
180 for i = 1to 26:print n$ (i );:if n$ (i + 1)=""then 200
190 print ",";:next i
200 print :print :for i = 1to l :print d$ (i );:next i :print :print
210 input "what is your guess";g$ :r = 0
220 for i = 1to 26:if n$ (i )=""then 250
230 if g$ =n$ (i )then print "you guessed that letter before!":goto 170
240 next i :print "program error.  run again.":stop
250 n$ (i )=g$ :t1 =t1 + 1
260 for i = 1to l :if l$ (i )=g$ then 280
270 next i :if r = 0then 290
275 goto 300
280 d$ (i )=g$ :r =r + 1:goto 270
290 m =m + 1:goto 400
300 for i = 1to l :if d$ (i )="-"then 320
310 next i :goto 390
320 print :for i = 1to l :print d$ (i );:next i :print :print
330 input "what is your guess for the word";b$
340 if a$ =b$ then 360
350 print "wrong.  try another letter.":print :goto 170
360 print "right!!  it took you";t1 ;"guesses!"
370 input "want another word";w$ :if w$ ="yes"then 50
380 print :print "it's been fun!  bye for now.":goto 999
390 print "you found the word!":goto 370
400 print :print :print "sorry, that letter isn't in the word."
410 on m goto 415,420,425,430,435,440,445,450,455,460
415 print "first, we draw a head":goto 470
420 print "now we draw a body.":goto 470
425 print "next we draw an arm.":goto 470
430 print "this time it's the other arm.":goto 470
435 print "now, let's draw the right leg.":goto 470
440 print "this time we draw the left leg.":goto 470
445 print "now we put up a hand.":goto 470
450 print "next the other hand.":goto 470
455 print "now we draw one foot":goto 470
460 print "here's the other foot -- you're hung!!"
470 on m goto 480,490,500,510,520,530,540,550,560,570
480 p$ ( 3, 6)="{114}":p$ ( 3, 7)="{184}":p$ ( 3, 8)="{114}":p$ ( 4, 5)="(":p$ ( 4, 6)="{119}"
481 p$ ( 4, 8)="{119}":p$ ( 4, 9)=")":p$ ( 5, 6)="-":p$ ( 5, 7)="-":p$ ( 5, 8)="-":goto 580
490 for i = 6to  9:p$ (i , 7)="{166}":next i :goto 580
500 for i = 4to  7:p$ (i ,i - 1)="{109}":next i :goto 580
510 p$ ( 4,11)="/":p$ ( 5,10)="/":p$ ( 6, 9)="{110}":p$ ( 7, 8)="/":goto 580
520 p$ (10, 6)="/":p$ (11, 5)="/":goto 580
530 p$ (10, 8)="{109}":p$ (11, 9)="{109}":goto 580
540 p$ ( 3,11)="{109}":goto 580
550 p$ ( 3, 3)="/":goto 580
560 p$ (12,10)="{109}":p$ (12,11)="-":goto 580
570 p$ (12, 3)="-":p$ (12, 4)="/"
580 for i = 1to 12:for j = 1to 12:print p$ (i ,j );:next j
590 print :next i :print :print :if m <>10then 170
600 print "sorry, you lose.  the word was ";a$
610 print "you missed that one.  do you ";:goto 370
620 input "type yes or no";y$ :if left$ (y$ , 1)="y"then 50
700 data "gum","sin","for","cry","lug","bye","fly"
710 data "ugly","each","from","work","talk","with","self"
720 data "pizza","thing","feign","fiend","elbow","fault","dirty"
730 data "budget","spirit","quaint","maiden","escort","pickax"
740 data "example","tension","quinine","kidney","replica","sleeper"
750 data "triangle","kangaroo","mahogany","sergeant","sequence"
760 data "moustache","dangerous","scientist","different","quiescent"
770 data "magistrate","erroneously","loudspeaker","phytotoxic"
780 data "matrimonial","parasympathomimetic","thigmotropism"
990 print "bye now"
999 end