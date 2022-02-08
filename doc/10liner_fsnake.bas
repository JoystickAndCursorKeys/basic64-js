0 s=0:tp=0:poke53281,0:poke53280,0:print"{clear}use z,x keys":print "<any key>"
1 get a$ :if a$ =""then goto 1
2 br=53280:print "{clear}":x =19:s = 0:cr=55856
3 get a$ :s =s + 1: if peek (1584+x ) =42then 7
5 poke 1584+x,81:pokecr+x,7:bc=int(s/20):ifa$="z"ora$ ="x"thenx=x-(asc(a$)-89)
6 print:o=int(rnd(1)*40):poke1984+o,42:pokecr+o,3:pokebr,bcand255:goto 3
7 print"{home}{white}";spc(10);"gameover sc:";s;" top:";tp:ifs>tpthentp=s
8 geta$:ifa$=""then8 
9 goto2
