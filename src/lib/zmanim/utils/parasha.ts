import { HDate } from '@hebcal/core'

export function getParashaSpecial(jsDate: Date): string {
  const hdate = new HDate(jsDate);
  const year = hdate.yy;
  const rd = hdate.abs();

  let parasha = '';

    if (HDate.isLeapYear(year)) {  
        if (year === 5771 || year === 5774) {
            // build threshold dates (month=1, days 1,4,11,18) in Hebrew calendar
            const alef      = new HDate( 1, 7, year)
            const daleth    = new HDate( 4, 7, year)
            const youd_alef = new HDate(11, 7, year)
            const youd_heth = new HDate(18, 7, year)

            // const alef      = new HDate( 1, 7, year)
            // const daleth    = new HDate(year, 1,  4)
            // const youd_alef = new HDate(year, 1, 11)
            // const youd_heth = new HDate(year, 1, 18)

            // 3. cascade comparisons
            if (rd >= alef.abs())      parasha = 'האזינו';
            if (rd >= daleth.abs())    parasha = ' ';
            if (rd >= youd_alef.abs()) parasha = 'שבת חול המועד';
            if (rd >= youd_heth.abs()) parasha = 'בראשית';
            if (rd >= youd_heth.add(7).abs())   parasha = 'נח';
            if (rd >= youd_heth.add(14).abs())  parasha = 'לך לך';
            if (rd >= youd_heth.add(21).abs())  parasha = 'וירא';
            if (rd >= youd_heth.add(28).abs())  parasha = 'חיי שרה';
            if (rd >= youd_heth.add(35).abs())  parasha = 'תולדות';
            if (rd >= youd_heth.add(42).abs())  parasha = 'ויצא';
            if (rd >= youd_heth.add(49).abs())  parasha = 'וישלח';
            if (rd >= youd_heth.add(56).abs())  parasha = 'וישב';
            if (rd >= youd_heth.add(63).abs())  parasha = 'מקץ';
            if (rd >= youd_heth.add(70).abs())  parasha = 'ויגש';
            if (rd >= youd_heth.add(77).abs())  parasha = 'ויחי';
            if (rd >= youd_heth.add(84).abs())  parasha = 'שמות';
            if (rd >= youd_heth.add(91).abs())  parasha = 'וארא'
            if (rd >= youd_heth.add(98).abs())  parasha = 'בא'
            if (rd >= youd_heth.add(105).abs()) parasha = 'בשלח'
            if (rd >= youd_heth.add(112).abs()) parasha = 'יתרו'
            if (rd >= youd_heth.add(119).abs()) parasha = 'משפטים'
            if (rd >= youd_heth.add(126).abs()) parasha = 'תרומה'
            if (rd >= youd_heth.add(133).abs()) parasha = 'תצוה'
            if (rd >= youd_heth.add(140).abs()) parasha = 'כי תשא'
            if (rd >= youd_heth.add(147).abs()) parasha = 'ויקהל'
            if (rd >= youd_heth.add(154).abs()) parasha = 'פקודי'
            if (rd >= youd_heth.add(161).abs()) parasha = 'ויקרא'
            if (rd >= youd_heth.add(168).abs()) parasha = 'צו'
            if (rd >= youd_heth.add(175).abs()) parasha = 'שמיני'
            if (rd >= youd_heth.add(182).abs()) parasha = 'תזריע'
            if (rd >= youd_heth.add(189).abs()) parasha = 'מצורע'
            if (rd >= youd_heth.add(196).abs()) parasha = 'אחרי מות'
            if (rd >= youd_heth.add(203).abs()) parasha = 'שבת חול המועד'
            if (rd >= youd_heth.add(210).abs()) parasha = 'קדושים'
            if (rd >= youd_heth.add(217).abs()) parasha = 'אמר'
            if (rd >= youd_heth.add(224).abs()) parasha = 'בהר'
            if (rd >= youd_heth.add(231).abs()) parasha = 'בחוקותי'
            if (rd >= youd_heth.add(238).abs()) parasha = 'במדבר'
            if (rd >= youd_heth.add(245).abs()) parasha = 'נשא'
            if (rd >= youd_heth.add(252).abs()) parasha = 'בהעלתך'
            if (rd >= youd_heth.add(259).abs()) parasha = 'שלח לך'
            if (rd >= youd_heth.add(266).abs()) parasha = 'קרח'
            if (rd >= youd_heth.add(273).abs()) parasha = 'חקת'
            if (rd >= youd_heth.add(280).abs()) parasha = 'בלק'
            if (rd >= youd_heth.add(287).abs()) parasha = 'פנחס'
            if (rd >= youd_heth.add(294).abs()) parasha = 'מטות'
            if (rd >= youd_heth.add(301).abs()) parasha = 'מסעי'
            if (rd >= youd_heth.add(308).abs()) parasha = 'דברים'
            if (rd >= youd_heth.add(315).abs()) parasha = 'ואתחנן'
            if (rd >= youd_heth.add(322).abs()) parasha = 'עקב'
            if (rd >= youd_heth.add(329).abs()) parasha = 'ראה'
            if (rd >= youd_heth.add(336).abs()) parasha = 'שפטים'
            if (rd >= youd_heth.add(343).abs()) parasha = 'כי תצא'
            if (rd >= youd_heth.add(350).abs()) parasha = 'כי תבוא'
            if (rd >= youd_heth.add(357).abs()) parasha = 'נצבים-וילך'
            if (rd >= youd_heth.add(364).abs()) parasha = 'האזינו'
        }
        
        else if (year === 5776 || year === 5779) {
            // שנת תשע"ו; תשע"ט
            const alef        = new HDate( 1, 7, year);
            const haazino     = new HDate( 7, 7, year);
            const youd_daleth = new HDate(14, 7, year);
            const kaf_alef    = new HDate(21, 7, year);

            if (rd >= alef.abs()      && rd < haazino.abs())      parasha = "וילך";
            if (rd >= haazino.abs()   && rd < youd_daleth.abs())  parasha = "האזינו";
            if (rd >= youd_daleth.abs() && rd < kaf_alef.abs())   parasha = "שבת חול המועד";
            if (rd >= kaf_alef.abs()    && rd < kaf_alef.add(7).abs())   parasha = "בראשית";
            if (rd >= kaf_alef.add(7).abs()   && rd < kaf_alef.add(14).abs()) parasha = "נח";
            if (rd >= kaf_alef.add(14).abs()  && rd < kaf_alef.add(21).abs()) parasha = "לך לך";
            if (rd >= kaf_alef.add(21).abs()  && rd < kaf_alef.add(28).abs()) parasha = "וירא";
            if (rd >= kaf_alef.add(28).abs()  && rd < kaf_alef.add(35).abs()) parasha = "חיי שרה";
            if (rd >= kaf_alef.add(35).abs()  && rd < kaf_alef.add(42).abs()) parasha = "תולדות";
            if (rd >= kaf_alef.add(42).abs()  && rd < kaf_alef.add(49).abs()) parasha = "ויצא";
            if (rd >= kaf_alef.add(49).abs()  && rd < kaf_alef.add(56).abs()) parasha = "וישלח";
            if (rd >= kaf_alef.add(56).abs()  && rd < kaf_alef.add(63).abs()) parasha = "וישב";
            if (rd >= kaf_alef.add(63).abs()  && rd < kaf_alef.add(70).abs()) parasha = "מקץ";
            if (rd >= kaf_alef.add(70).abs()  && rd < kaf_alef.add(77).abs()) parasha = "ויגש";
            if (rd >= kaf_alef.add(77).abs()  && rd < kaf_alef.add(84).abs()) parasha = "ויחי";
            if (rd >= kaf_alef.add(84).abs()  && rd < kaf_alef.add(91).abs()) parasha = "שמות";
            if (rd >= kaf_alef.add(91).abs()  && rd < kaf_alef.add(98).abs()) parasha = "וארא";
            if (rd >= kaf_alef.add(98).abs()  && rd < kaf_alef.add(105).abs()) parasha = "בא";
            if (rd >= kaf_alef.add(105).abs() && rd < kaf_alef.add(112).abs()) parasha = "בשלח";
            if (rd >= kaf_alef.add(112).abs() && rd < kaf_alef.add(119).abs()) parasha = "יתרו";
            if (rd >= kaf_alef.add(119).abs() && rd < kaf_alef.add(126).abs()) parasha = "משפטים";
            if (rd >= kaf_alef.add(126).abs() && rd < kaf_alef.add(133).abs()) parasha = "תרומה";
            if (rd >= kaf_alef.add(133).abs() && rd < kaf_alef.add(140).abs()) parasha = "תצוה";
            if (rd >= kaf_alef.add(140).abs() && rd < kaf_alef.add(147).abs()) parasha = "כי תשא";
            if (rd >= kaf_alef.add(147).abs() && rd < kaf_alef.add(154).abs()) parasha = "ויקהל";
            if (rd >= kaf_alef.add(154).abs() && rd < kaf_alef.add(161).abs()) parasha = "פקודי";
            if (rd >= kaf_alef.add(161).abs() && rd < kaf_alef.add(168).abs()) parasha = "ויקרא";
            if (rd >= kaf_alef.add(168).abs() && rd < kaf_alef.add(175).abs()) parasha = "צו";
            if (rd >= kaf_alef.add(175).abs() && rd < kaf_alef.add(182).abs()) parasha = "שמיני";
            if (rd >= kaf_alef.add(182).abs() && rd < kaf_alef.add(189).abs()) parasha = "תזריע";
            if (rd >= kaf_alef.add(189).abs() && rd < kaf_alef.add(196).abs()) parasha = "מצורע";
            if (rd >= kaf_alef.add(196).abs() && rd < kaf_alef.add(203).abs()) parasha = "שבת חול המועד";
            if (rd >= kaf_alef.add(203).abs() && rd < kaf_alef.add(210).abs()) parasha = "אחרי מות";
            if (rd >= kaf_alef.add(210).abs() && rd < kaf_alef.add(217).abs()) parasha = "קדושים";
            if (rd >= kaf_alef.add(217).abs() && rd < kaf_alef.add(224).abs()) parasha = "אמר";
            if (rd >= kaf_alef.add(224).abs() && rd < kaf_alef.add(231).abs()) parasha = "בהר";
            if (rd >= kaf_alef.add(231).abs() && rd < kaf_alef.add(238).abs()) parasha = "בחוקותי";
            if (rd >= kaf_alef.add(238).abs() && rd < kaf_alef.add(245).abs()) parasha = "במדבר";
            if (rd >= kaf_alef.add(245).abs() && rd < kaf_alef.add(252).abs()) parasha = "נשא";
            if (rd >= kaf_alef.add(252).abs() && rd < kaf_alef.add(259).abs()) parasha = "בהעלתך";
            if (rd >= kaf_alef.add(259).abs() && rd < kaf_alef.add(266).abs()) parasha = "שלח לך";
            if (rd >= kaf_alef.add(266).abs() && rd < kaf_alef.add(273).abs()) parasha = "קרח";
            if (rd >= kaf_alef.add(273).abs() && rd < kaf_alef.add(280).abs()) parasha = "חקת";
            if (rd >= kaf_alef.add(280).abs() && rd < kaf_alef.add(287).abs()) parasha = "בלק";
            if (rd >= kaf_alef.add(287).abs() && rd < kaf_alef.add(294).abs()) parasha = "פנחס";
            if (rd >= kaf_alef.add(294).abs() && rd < kaf_alef.add(301).abs()) parasha = "מטות";
            if (rd >= kaf_alef.add(301).abs() && rd < kaf_alef.add(308).abs()) parasha = "מסעי";
            if (rd >= kaf_alef.add(308).abs() && rd < kaf_alef.add(315).abs()) parasha = "דברים";
            if (rd >= kaf_alef.add(315).abs() && rd < kaf_alef.add(322).abs()) parasha = "ואתחנן";
            if (rd >= kaf_alef.add(322).abs() && rd < kaf_alef.add(329).abs()) parasha = "עקב";
            if (rd >= kaf_alef.add(329).abs() && rd < kaf_alef.add(336).abs()) parasha = "ראה";
            if (rd >= kaf_alef.add(336).abs() && rd < kaf_alef.add(343).abs()) parasha = "שפטים";
            if (rd >= kaf_alef.add(343).abs() && rd < kaf_alef.add(350).abs()) parasha = "כי תצא";
            if (rd >= kaf_alef.add(350).abs() && rd < kaf_alef.add(357).abs()) parasha = "כי תבוא";
            if (rd >= kaf_alef.add(357).abs() && rd < kaf_alef.add(364).abs()) parasha = "נצבים";
            if (rd >= kaf_alef.add(364).abs() && rd < kaf_alef.add(371).abs()) parasha = "וילך";
        }
        
        else if (year === 5782) {
            // שנת תשפ"ב
            // הצגה של פרשת שבוע
            const alef        = new HDate( 1, 7, year);
            const haazino     = new HDate( 6, 7, year);
            const youd_guimel = new HDate(13, 7, year);
            const kaf         = new HDate(20, 7, year);

            if (rd >= alef.abs()           && rd < haazino.abs())      parasha = "וילך";
            if (rd >= haazino.abs()        && rd < youd_guimel.abs())  parasha = "האזינו";
            if (rd >= youd_guimel.abs()    && rd < kaf.abs())          parasha = "שבת חול המועד";
            if (rd >= kaf.abs()            && rd < kaf.add(7).abs())   parasha = "בראשית";
            if (rd >= kaf.add(7).abs()     && rd < kaf.add(14).abs())  parasha = "נח";
            if (rd >= kaf.add(14).abs()    && rd < kaf.add(21).abs())  parasha = "לך לך";
            if (rd >= kaf.add(21).abs()    && rd < kaf.add(28).abs())  parasha = "וירא";
            if (rd >= kaf.add(28).abs()    && rd < kaf.add(35).abs())  parasha = "חיי שרה";
            if (rd >= kaf.add(35).abs()    && rd < kaf.add(42).abs())  parasha = "תולדות";
            if (rd >= kaf.add(42).abs()    && rd < kaf.add(49).abs())  parasha = "ויצא";
            if (rd >= kaf.add(49).abs()    && rd < kaf.add(56).abs())  parasha = "וישלח";
            if (rd >= kaf.add(56).abs()    && rd < kaf.add(63).abs())  parasha = "וישב";
            if (rd >= kaf.add(63).abs()    && rd < kaf.add(70).abs())  parasha = "מקץ";
            if (rd >= kaf.add(70).abs()    && rd < kaf.add(77).abs())  parasha = "ויגש";
            if (rd >= kaf.add(77).abs()    && rd < kaf.add(84).abs())  parasha = "ויחי";
            if (rd >= kaf.add(84).abs()    && rd < kaf.add(91).abs())  parasha = "שמות";
            if (rd >= kaf.add(91).abs()    && rd < kaf.add(98).abs())  parasha = "וארא";
            if (rd >= kaf.add(98).abs()    && rd < kaf.add(105).abs()) parasha = "בא";
            if (rd >= kaf.add(105).abs()   && rd < kaf.add(112).abs()) parasha = "בשלח";
            if (rd >= kaf.add(112).abs()   && rd < kaf.add(119).abs()) parasha = "יתרו";
            if (rd >= kaf.add(119).abs()   && rd < kaf.add(126).abs()) parasha = "משפטים";
            if (rd >= kaf.add(126).abs()   && rd < kaf.add(133).abs()) parasha = "תרומה";
            if (rd >= kaf.add(133).abs()   && rd < kaf.add(140).abs()) parasha = "תצוה";
            if (rd >= kaf.add(140).abs()   && rd < kaf.add(147).abs()) parasha = "כי תשא";
            if (rd >= kaf.add(147).abs()   && rd < kaf.add(154).abs()) parasha = "ויקהל";
            if (rd >= kaf.add(154).abs()   && rd < kaf.add(161).abs()) parasha = "פקודי";
            if (rd >= kaf.add(161).abs()   && rd < kaf.add(168).abs()) parasha = "ויקרא";
            if (rd >= kaf.add(168).abs()   && rd < kaf.add(175).abs()) parasha = "צו";
            if (rd >= kaf.add(175).abs()   && rd < kaf.add(182).abs()) parasha = "שמיני";
            if (rd >= kaf.add(182).abs()   && rd < kaf.add(189).abs()) parasha = "תזריע";
            if (rd >= kaf.add(189).abs()   && rd < kaf.add(196).abs()) parasha = "מצורע";
            if (rd >= kaf.add(196).abs()   && rd < kaf.add(203).abs()) parasha = "שבת חול המועד";
            if (rd >= kaf.add(203).abs()   && rd < kaf.add(210).abs()) parasha = "אחרי מות";
            if (rd >= kaf.add(210).abs()   && rd < kaf.add(217).abs()) parasha = "קדושים";
            if (rd >= kaf.add(217).abs()   && rd < kaf.add(224).abs()) parasha = "אמר";
            if (rd >= kaf.add(224).abs()   && rd < kaf.add(231).abs()) parasha = "בהר";
            if (rd >= kaf.add(231).abs()   && rd < kaf.add(238).abs()) parasha = "בחוקותי";
            if (rd >= kaf.add(238).abs()   && rd < kaf.add(245).abs()) parasha = "במדבר";
            if (rd >= kaf.add(245).abs()   && rd < kaf.add(252).abs()) parasha = "נשא";
            if (rd >= kaf.add(252).abs()   && rd < kaf.add(259).abs()) parasha = "בהעלתך";
            if (rd >= kaf.add(259).abs()   && rd < kaf.add(266).abs()) parasha = "שלח לך";
            if (rd >= kaf.add(266).abs()   && rd < kaf.add(273).abs()) parasha = "קרח";
            if (rd >= kaf.add(273).abs()   && rd < kaf.add(280).abs()) parasha = "חקת";
            if (rd >= kaf.add(280).abs()   && rd < kaf.add(287).abs()) parasha = "בלק";
            if (rd >= kaf.add(287).abs()   && rd < kaf.add(294).abs()) parasha = "פנחס";
            if (rd >= kaf.add(294).abs()   && rd < kaf.add(301).abs()) parasha = "מטות";
            if (rd >= kaf.add(301).abs()   && rd < kaf.add(308).abs()) parasha = "מסעי";
            if (rd >= kaf.add(308).abs()   && rd < kaf.add(315).abs()) parasha = "דברים";
            if (rd >= kaf.add(315).abs()   && rd < kaf.add(322).abs()) parasha = "ואתחנן";
            if (rd >= kaf.add(322).abs()   && rd < kaf.add(329).abs()) parasha = "עקב";
            if (rd >= kaf.add(329).abs()   && rd < kaf.add(336).abs()) parasha = "ראה";
            if (rd >= kaf.add(336).abs()   && rd < kaf.add(343).abs()) parasha = "שפטים";
            if (rd >= kaf.add(343).abs()   && rd < kaf.add(350).abs()) parasha = "כי תצא";
            if (rd >= kaf.add(350).abs()   && rd < kaf.add(357).abs()) parasha = "כי תבוא";
            if (rd >= kaf.add(357).abs()   && rd < kaf.add(364).abs()) parasha = "נצבים";
            if (rd >= kaf.add(364).abs()   && rd < kaf.add(371).abs()) parasha = "וילך";
        }
        
        else if (year === 5787) {
            // שנת תשפ"ז – הצגה של פרשת שבוע
            const haazino     = new HDate( 2, 7, year);
            const teth        = new HDate( 9, 7, year);
            const teth_zain   = new HDate(16, 7, year);
            const kaf_guimel  = new HDate(23, 7, year);

            if (rd >= haazino.abs()           && rd < teth.abs())        parasha = "האזינו";
            if (rd >= teth.abs()              && rd < teth_zain.abs())   parasha = " ";
            if (rd >= teth_zain.abs()         && rd < kaf_guimel.abs())  parasha = " ";
            if (rd >= kaf_guimel.abs()        && rd < kaf_guimel.add(7).abs())   parasha = "בראשית";
            if (rd >= kaf_guimel.add(7).abs()  && rd < kaf_guimel.add(14).abs()) parasha = "נח";
            if (rd >= kaf_guimel.add(14).abs() && rd < kaf_guimel.add(21).abs()) parasha = "לך לך";
            if (rd >= kaf_guimel.add(21).abs() && rd < kaf_guimel.add(28).abs()) parasha = "וירא";
            if (rd >= kaf_guimel.add(28).abs() && rd < kaf_guimel.add(35).abs()) parasha = "חיי שרה";
            if (rd >= kaf_guimel.add(35).abs() && rd < kaf_guimel.add(42).abs()) parasha = "תולדות";
            if (rd >= kaf_guimel.add(42).abs() && rd < kaf_guimel.add(49).abs()) parasha = "ויצא";
            if (rd >= kaf_guimel.add(49).abs() && rd < kaf_guimel.add(56).abs()) parasha = "וישלח";
            if (rd >= kaf_guimel.add(56).abs() && rd < kaf_guimel.add(63).abs()) parasha = "וישב";
            if (rd >= kaf_guimel.add(63).abs() && rd < kaf_guimel.add(70).abs()) parasha = "מקץ";
            if (rd >= kaf_guimel.add(70).abs() && rd < kaf_guimel.add(77).abs()) parasha = "ויגש";
            if (rd >= kaf_guimel.add(77).abs() && rd < kaf_guimel.add(84).abs()) parasha = "ויחי";
            if (rd >= kaf_guimel.add(84).abs() && rd < kaf_guimel.add(91).abs()) parasha = "שמות";
            if (rd >= kaf_guimel.add(91).abs() && rd < kaf_guimel.add(98).abs()) parasha = "וארא";
            if (rd >= kaf_guimel.add(98).abs() && rd < kaf_guimel.add(105).abs()) parasha = "בא";
            if (rd >= kaf_guimel.add(105).abs() && rd < kaf_guimel.add(112).abs()) parasha = "בשלח";
            if (rd >= kaf_guimel.add(112).abs() && rd < kaf_guimel.add(119).abs()) parasha = "יתרו";
            if (rd >= kaf_guimel.add(119).abs() && rd < kaf_guimel.add(126).abs()) parasha = "משפטים";
            if (rd >= kaf_guimel.add(126).abs() && rd < kaf_guimel.add(133).abs()) parasha = "תרומה";
            if (rd >= kaf_guimel.add(133).abs() && rd < kaf_guimel.add(140).abs()) parasha = "תצוה";
            if (rd >= kaf_guimel.add(140).abs() && rd < kaf_guimel.add(147).abs()) parasha = "כי תשא";
            if (rd >= kaf_guimel.add(147).abs() && rd < kaf_guimel.add(154).abs()) parasha = "ויקהל";
            if (rd >= kaf_guimel.add(154).abs() && rd < kaf_guimel.add(161).abs()) parasha = "פקודי";
            if (rd >= kaf_guimel.add(161).abs() && rd < kaf_guimel.add(168).abs()) parasha = "ויקרא";
            if (rd >= kaf_guimel.add(168).abs() && rd < kaf_guimel.add(175).abs()) parasha = "צו";
            if (rd >= kaf_guimel.add(175).abs() && rd < kaf_guimel.add(182).abs()) parasha = "שמיני";
            if (rd >= kaf_guimel.add(182).abs() && rd < kaf_guimel.add(189).abs()) parasha = "תזריע";
            if (rd >= kaf_guimel.add(189).abs() && rd < kaf_guimel.add(196).abs()) parasha = "מצורע";
            if (rd >= kaf_guimel.add(196).abs() && rd < kaf_guimel.add(203).abs()) parasha = "שבת חול המועד";
            if (rd >= kaf_guimel.add(203).abs() && rd < kaf_guimel.add(210).abs()) parasha = "אחרי מות";
            if (rd >= kaf_guimel.add(210).abs() && rd < kaf_guimel.add(217).abs()) parasha = "קדושים";
            if (rd >= kaf_guimel.add(217).abs() && rd < kaf_guimel.add(224).abs()) parasha = "אמר";
            if (rd >= kaf_guimel.add(224).abs() && rd < kaf_guimel.add(231).abs()) parasha = "בהר";
            if (rd >= kaf_guimel.add(231).abs() && rd < kaf_guimel.add(238).abs()) parasha = "בחוקותי";
            if (rd >= kaf_guimel.add(238).abs() && rd < kaf_guimel.add(245).abs()) parasha = "במדבר";
            if (rd >= kaf_guimel.add(245).abs() && rd < kaf_guimel.add(252).abs()) parasha = "נשא";
            if (rd >= kaf_guimel.add(252).abs() && rd < kaf_guimel.add(259).abs()) parasha = "בהעלתך";
            if (rd >= kaf_guimel.add(259).abs() && rd < kaf_guimel.add(266).abs()) parasha = "שלח לך";
            if (rd >= kaf_guimel.add(266).abs() && rd < kaf_guimel.add(273).abs()) parasha = "קרח";
            if (rd >= kaf_guimel.add(273).abs() && rd < kaf_guimel.add(280).abs()) parasha = "חקת";
            if (rd >= kaf_guimel.add(280).abs() && rd < kaf_guimel.add(287).abs()) parasha = "בלק";
            if (rd >= kaf_guimel.add(287).abs() && rd < kaf_guimel.add(294).abs()) parasha = "פנחס";
            if (rd >= kaf_guimel.add(294).abs() && rd < kaf_guimel.add(301).abs()) parasha = "מטות-מסעי";
            if (rd >= kaf_guimel.add(301).abs() && rd < kaf_guimel.add(308).abs()) parasha = "דברים";
            if (rd >= kaf_guimel.add(308).abs() && rd < kaf_guimel.add(315).abs()) parasha = "ואתחנן";
            if (rd >= kaf_guimel.add(315).abs() && rd < kaf_guimel.add(322).abs()) parasha = "עקב";
            if (rd >= kaf_guimel.add(322).abs() && rd < kaf_guimel.add(329).abs()) parasha = "ראה";
            if (rd >= kaf_guimel.add(329).abs() && rd < kaf_guimel.add(336).abs()) parasha = "שפטים";
            if (rd >= kaf_guimel.add(336).abs() && rd < kaf_guimel.add(343).abs()) parasha = "כי תצא";
            if (rd >= kaf_guimel.add(343).abs() && rd < kaf_guimel.add(350).abs()) parasha = "כי תבוא";
            if (rd >= kaf_guimel.add(350).abs() && rd < kaf_guimel.add(357).abs()) parasha = "נצבים-וילך";
            if (rd >= kaf_guimel.add(357).abs() && rd < kaf_guimel.add(364).abs()) parasha = " ";
        }   
        
        else if (year === 5784) {
            // שנת תשפ"ד – הצגה של פרשת שבוע
            const haazino    = new HDate( 2, 7, year);
            const teth       = new HDate( 9, 7, year);
            const teth_zain  = new HDate(16, 7, year);
            const kaf_guimel = new HDate(23, 7, year);

            if (rd >= haazino.abs()           && rd < teth.abs())        parasha = "האזינו";
            if (rd >= teth.abs()              && rd < teth_zain.abs())   parasha = " ";
            if (rd >= teth_zain.abs()         && rd < kaf_guimel.abs())  parasha = " ";
            if (rd >= kaf_guimel.abs()        && rd < kaf_guimel.add(7).abs())   parasha = "בראשית";
            if (rd >= kaf_guimel.add(7).abs() && rd < kaf_guimel.add(14).abs())  parasha = "נח";
            if (rd >= kaf_guimel.add(14).abs()&& rd < kaf_guimel.add(21).abs())  parasha = "לך לך";
            if (rd >= kaf_guimel.add(21).abs()&& rd < kaf_guimel.add(28).abs())  parasha = "וירא";
            if (rd >= kaf_guimel.add(28).abs()&& rd < kaf_guimel.add(35).abs())  parasha = "חיי שרה";
            if (rd >= kaf_guimel.add(35).abs()&& rd < kaf_guimel.add(42).abs())  parasha = "תולדות";
            if (rd >= kaf_guimel.add(42).abs()&& rd < kaf_guimel.add(49).abs())  parasha = "ויצא";
            if (rd >= kaf_guimel.add(49).abs()&& rd < kaf_guimel.add(56).abs())  parasha = "וישלח";
            if (rd >= kaf_guimel.add(56).abs()&& rd < kaf_guimel.add(63).abs())  parasha = "וישב";
            if (rd >= kaf_guimel.add(63).abs()&& rd < kaf_guimel.add(70).abs())  parasha = "מקץ";
            if (rd >= kaf_guimel.add(70).abs()&& rd < kaf_guimel.add(77).abs())  parasha = "ויגש";
            if (rd >= kaf_guimel.add(77).abs()&& rd < kaf_guimel.add(84).abs())  parasha = "ויחי";
            if (rd >= kaf_guimel.add(84).abs()&& rd < kaf_guimel.add(91).abs())  parasha = "שמות";
            if (rd >= kaf_guimel.add(91).abs()&& rd < kaf_guimel.add(98).abs())  parasha = "וארא";
            if (rd >= kaf_guimel.add(98).abs()&& rd < kaf_guimel.add(105).abs()) parasha = "בא";
            if (rd >= kaf_guimel.add(105).abs()&& rd < kaf_guimel.add(112).abs()) parasha = "בשלח";
            if (rd >= kaf_guimel.add(112).abs()&& rd < kaf_guimel.add(119).abs()) parasha = "יתרו";
            if (rd >= kaf_guimel.add(119).abs()&& rd < kaf_guimel.add(126).abs()) parasha = "משפטים";
            if (rd >= kaf_guimel.add(126).abs()&& rd < kaf_guimel.add(133).abs()) parasha = "תרומה";
            if (rd >= kaf_guimel.add(133).abs()&& rd < kaf_guimel.add(140).abs()) parasha = "תצוה";
            if (rd >= kaf_guimel.add(140).abs()&& rd < kaf_guimel.add(147).abs()) parasha = "כי תשא";
            if (rd >= kaf_guimel.add(147).abs()&& rd < kaf_guimel.add(154).abs()) parasha = "ויקהל";
            if (rd >= kaf_guimel.add(154).abs()&& rd < kaf_guimel.add(161).abs()) parasha = "פקודי";
            if (rd >= kaf_guimel.add(161).abs()&& rd < kaf_guimel.add(168).abs()) parasha = "ויקרא";
            if (rd >= kaf_guimel.add(168).abs()&& rd < kaf_guimel.add(175).abs()) parasha = "צו";
            if (rd >= kaf_guimel.add(175).abs()&& rd < kaf_guimel.add(182).abs()) parasha = "שמיני";
            if (rd >= kaf_guimel.add(182).abs()&& rd < kaf_guimel.add(189).abs()) parasha = "תזריע";
            if (rd >= kaf_guimel.add(189).abs()&& rd < kaf_guimel.add(196).abs()) parasha = "מצורע";
            if (rd >= kaf_guimel.add(196).abs()&& rd < kaf_guimel.add(203).abs()) parasha = "שבת חול המועד";
            if (rd >= kaf_guimel.add(203).abs()&& rd < kaf_guimel.add(210).abs()) parasha = "אחרי מות";
            if (rd >= kaf_guimel.add(210).abs()&& rd < kaf_guimel.add(217).abs()) parasha = "קדושים";
            if (rd >= kaf_guimel.add(217).abs()&& rd < kaf_guimel.add(224).abs()) parasha = "אמר";
            if (rd >= kaf_guimel.add(224).abs()&& rd < kaf_guimel.add(231).abs()) parasha = "בהר";
            if (rd >= kaf_guimel.add(231).abs()&& rd < kaf_guimel.add(238).abs()) parasha = "בחוקותי";
            if (rd >= kaf_guimel.add(238).abs()&& rd < kaf_guimel.add(245).abs()) parasha = "במדבר";
            if (rd >= kaf_guimel.add(245).abs()&& rd < kaf_guimel.add(252).abs()) parasha = "נשא";
            if (rd >= kaf_guimel.add(252).abs()&& rd < kaf_guimel.add(259).abs()) parasha = "בהעלתך";
            if (rd >= kaf_guimel.add(259).abs()&& rd < kaf_guimel.add(266).abs()) parasha = "שלח לך";
            if (rd >= kaf_guimel.add(266).abs()&& rd < kaf_guimel.add(273).abs()) parasha = "קרח";
            if (rd >= kaf_guimel.add(273).abs()&& rd < kaf_guimel.add(280).abs()) parasha = "חקת";
            if (rd >= kaf_guimel.add(280).abs()&& rd < kaf_guimel.add(287).abs()) parasha = "בלק";
            if (rd >= kaf_guimel.add(287).abs()&& rd < kaf_guimel.add(294).abs()) parasha = "פנחס";
            if (rd >= kaf_guimel.add(294).abs()&& rd < kaf_guimel.add(301).abs()) parasha = "מטות-מסעי";
            if (rd >= kaf_guimel.add(301).abs()&& rd < kaf_guimel.add(308).abs()) parasha = "דברים";
            if (rd >= kaf_guimel.add(308).abs()&& rd < kaf_guimel.add(315).abs()) parasha = "ואתחנן";
            if (rd >= kaf_guimel.add(315).abs()&& rd < kaf_guimel.add(322).abs()) parasha = "עקב";
            if (rd >= kaf_guimel.add(322).abs()&& rd < kaf_guimel.add(329).abs()) parasha = "ראה";
            if (rd >= kaf_guimel.add(329).abs()&& rd < kaf_guimel.add(336).abs()) parasha = "שפטים";
            if (rd >= kaf_guimel.add(336).abs()&& rd < kaf_guimel.add(343).abs()) parasha = "כי תצא";
            if (rd >= kaf_guimel.add(343).abs()&& rd < kaf_guimel.add(350).abs()) parasha = "כי תבוא";
            if (rd >= kaf_guimel.add(350).abs()&& rd < kaf_guimel.add(357).abs()) parasha = "נצבים-וילך";
            if (rd >= kaf_guimel.add(357).abs()&& rd < kaf_guimel.add(364).abs()) parasha = "האזינו";
        }        
    }

    else {
        if (year === 5778 || year === 5789) {
            // arranger
            // הצגה של פרשת שבוע
            const alef       = new HDate( 1, 7, year)
            const daleth     = new HDate( 4, 7, year)
            const youd_alef  = new HDate(11, 7, year)
            const youd_heth  = new HDate(18, 7, year)

            if (rd >= alef.abs()               && rd < daleth.abs())       parasha = "האזינו"
            if (rd >= daleth.abs()             && rd < youd_alef.abs())    parasha = " "
            if (rd >= youd_alef.abs()          && rd < youd_heth.abs())    parasha = "שבת חול המועד"
            if (rd >= youd_heth.abs()          && rd < youd_heth.add(7).abs())   parasha = "בראשית"
            if (rd >= youd_heth.add(7).abs()   && rd < youd_heth.add(14).abs())  parasha = "נח"
            if (rd >= youd_heth.add(14).abs()  && rd < youd_heth.add(21).abs())  parasha = "לך לך"
            if (rd >= youd_heth.add(21).abs()  && rd < youd_heth.add(28).abs())  parasha = "וירא"
            if (rd >= youd_heth.add(28).abs()  && rd < youd_heth.add(35).abs())  parasha = "חיי שרה"
            if (rd >= youd_heth.add(35).abs()  && rd < youd_heth.add(42).abs())  parasha = "תולדות"
            if (rd >= youd_heth.add(42).abs()  && rd < youd_heth.add(49).abs())  parasha = "ויצא"
            if (rd >= youd_heth.add(49).abs()  && rd < youd_heth.add(56).abs())  parasha = "וישלח"
            if (rd >= youd_heth.add(56).abs()  && rd < youd_heth.add(63).abs())  parasha = "וישב"
            if (rd >= youd_heth.add(63).abs()  && rd < youd_heth.add(70).abs())  parasha = "מקץ"
            if (rd >= youd_heth.add(70).abs()  && rd < youd_heth.add(77).abs())  parasha = "ויגש"
            if (rd >= youd_heth.add(77).abs()  && rd < youd_heth.add(84).abs())  parasha = "ויחי"
            if (rd >= youd_heth.add(84).abs()  && rd < youd_heth.add(91).abs())  parasha = "שמות"
            if (rd >= youd_heth.add(91).abs()  && rd < youd_heth.add(98).abs())  parasha = "וארא"
            if (rd >= youd_heth.add(98).abs()  && rd < youd_heth.add(105).abs()) parasha = "בא"
            if (rd >= youd_heth.add(105).abs() && rd < youd_heth.add(112).abs()) parasha = "בשלח"
            if (rd >= youd_heth.add(112).abs() && rd < youd_heth.add(119).abs()) parasha = "יתרו"
            if (rd >= youd_heth.add(119).abs() && rd < youd_heth.add(126).abs()) parasha = "משפטים"
            if (rd >= youd_heth.add(126).abs() && rd < youd_heth.add(133).abs()) parasha = "תרומה"
            if (rd >= youd_heth.add(133).abs() && rd < youd_heth.add(140).abs()) parasha = "תצוה"
            if (rd >= youd_heth.add(140).abs() && rd < youd_heth.add(147).abs()) parasha = "כי תשא"
            if (rd >= youd_heth.add(147).abs() && rd < youd_heth.add(154).abs()) parasha = "ויקהל-פקודי"
            if (rd >= youd_heth.add(154).abs() && rd < youd_heth.add(161).abs()) parasha = "ויקרא"
            if (rd >= youd_heth.add(161).abs() && rd < youd_heth.add(168).abs()) parasha = "צו"
            if (rd >= youd_heth.add(168).abs() && rd < youd_heth.add(175).abs()) parasha = "שבת חול המועד"
            if (rd >= youd_heth.add(175).abs() && rd < youd_heth.add(182).abs()) parasha = "שמיני"
            if (rd >= youd_heth.add(182).abs() && rd < youd_heth.add(189).abs()) parasha = "תזריע-מצורע"
            if (rd >= youd_heth.add(189).abs() && rd < youd_heth.add(196).abs()) parasha = "אחרי מות-קדושים"
            if (rd >= youd_heth.add(196).abs() && rd < youd_heth.add(203).abs()) parasha = "אמר"
            if (rd >= youd_heth.add(203).abs() && rd < youd_heth.add(210).abs()) parasha = "בהר"
            if (rd >= youd_heth.add(210).abs() && rd < youd_heth.add(217).abs()) parasha = "בחוקותי"
            if (rd >= youd_heth.add(217).abs() && rd < youd_heth.add(224).abs()) parasha = "במדבר"
            if (rd >= youd_heth.add(224).abs() && rd < youd_heth.add(231).abs()) parasha = "נשא"
            if (rd >= youd_heth.add(231).abs() && rd < youd_heth.add(238).abs()) parasha = "בהעלתך"
            if (rd >= youd_heth.add(238).abs() && rd < youd_heth.add(245).abs()) parasha = "שלח לך"
            if (rd >= youd_heth.add(245).abs() && rd < youd_heth.add(252).abs()) parasha = "קרח"
            if (rd >= youd_heth.add(252).abs() && rd < youd_heth.add(259).abs()) parasha = "חקת"
            if (rd >= youd_heth.add(259).abs() && rd < youd_heth.add(266).abs()) parasha = "בלק"
            if (rd >= youd_heth.add(266).abs() && rd < youd_heth.add(273).abs()) parasha = "פינחס"
            if (rd >= youd_heth.add(273).abs() && rd < youd_heth.add(280).abs()) parasha = "מטות-מסעי"
            if (rd >= youd_heth.add(280).abs() && rd < youd_heth.add(287).abs()) parasha = "דברים"
            if (rd >= youd_heth.add(287).abs() && rd < youd_heth.add(294).abs()) parasha = "ואתחנן"
            if (rd >= youd_heth.add(294).abs() && rd < youd_heth.add(301).abs()) parasha = "עקב"
            if (rd >= youd_heth.add(301).abs() && rd < youd_heth.add(308).abs()) parasha = "ראה"
            if (rd >= youd_heth.add(308).abs() && rd < youd_heth.add(315).abs()) parasha = "שפטים"
            if (rd >= youd_heth.add(315).abs() && rd < youd_heth.add(322).abs()) parasha = "כי תצא"
            if (rd >= youd_heth.add(322).abs() && rd < youd_heth.add(329).abs()) parasha = "כי תבוא"
            if (rd >= youd_heth.add(329).abs() && rd < youd_heth.add(336).abs()) parasha = "נצבים"
            if (rd >= youd_heth.add(336).abs() && rd < youd_heth.add(343).abs()) parasha = "וילך"
        }
        
        else if (year === 5772 || year === 5775) {
            // שנת תשע"ב, תשע"ח – arranger
            // הצגה של פרשת שבוע
            const alef      = new HDate( 1, 7, year)
            const daleth    = new HDate( 4, 7, year)
            const youd_alef = new HDate(11, 7, year)
            const youd_heth = new HDate(18, 7, year)

            if (rd >= alef.abs()               && rd < daleth.abs())       parasha = "האזינו"
            if (rd >= daleth.abs()             && rd < youd_alef.abs())    parasha = " "
            if (rd >= youd_alef.abs()          && rd < youd_heth.abs())    parasha = "שבת חול המועד"
            if (rd >= youd_heth.abs()          && rd < youd_heth.add(7).abs())   parasha = "בראשית"
            if (rd >= youd_heth.add(7).abs()   && rd < youd_heth.add(14).abs())  parasha = "נח"
            if (rd >= youd_heth.add(14).abs()  && rd < youd_heth.add(21).abs())  parasha = "לך לך"
            if (rd >= youd_heth.add(21).abs()  && rd < youd_heth.add(28).abs())  parasha = "וירא"
            if (rd >= youd_heth.add(28).abs()  && rd < youd_heth.add(35).abs())  parasha = "חיי שרה"
            if (rd >= youd_heth.add(35).abs()  && rd < youd_heth.add(42).abs())  parasha = "תולדות"
            if (rd >= youd_heth.add(42).abs()  && rd < youd_heth.add(49).abs())  parasha = "ויצא"
            if (rd >= youd_heth.add(49).abs()  && rd < youd_heth.add(56).abs())  parasha = "וישלח"
            if (rd >= youd_heth.add(56).abs()  && rd < youd_heth.add(63).abs())  parasha = "וישב"
            if (rd >= youd_heth.add(63).abs()  && rd < youd_heth.add(70).abs())  parasha = "מקץ"
            if (rd >= youd_heth.add(70).abs()  && rd < youd_heth.add(77).abs())  parasha = "ויגש"
            if (rd >= youd_heth.add(77).abs()  && rd < youd_heth.add(84).abs())  parasha = "ויחי"
            if (rd >= youd_heth.add(84).abs()  && rd < youd_heth.add(91).abs())  parasha = "שמות"
            if (rd >= youd_heth.add(91).abs()  && rd < youd_heth.add(98).abs())  parasha = "וארא"
            if (rd >= youd_heth.add(98).abs()  && rd < youd_heth.add(105).abs()) parasha = "בא"
            if (rd >= youd_heth.add(105).abs() && rd < youd_heth.add(112).abs()) parasha = "בשלח"
            if (rd >= youd_heth.add(112).abs() && rd < youd_heth.add(119).abs()) parasha = "יתרו"
            if (rd >= youd_heth.add(119).abs() && rd < youd_heth.add(126).abs()) parasha = "משפטים"
            if (rd >= youd_heth.add(126).abs() && rd < youd_heth.add(133).abs()) parasha = "תרומה"
            if (rd >= youd_heth.add(133).abs() && rd < youd_heth.add(140).abs()) parasha = "תצוה"
            if (rd >= youd_heth.add(140).abs() && rd < youd_heth.add(147).abs()) parasha = "כי תשא"
            if (rd >= youd_heth.add(147).abs() && rd < youd_heth.add(154).abs()) parasha = "ויקהל-פקודי"
            if (rd >= youd_heth.add(154).abs() && rd < youd_heth.add(161).abs()) parasha = "ויקרא"
            if (rd >= youd_heth.add(161).abs() && rd < youd_heth.add(168).abs()) parasha = "צו"
            if (rd >= youd_heth.add(168).abs() && rd < youd_heth.add(175).abs()) parasha = " "
            if (rd >= youd_heth.add(175).abs() && rd < youd_heth.add(182).abs()) parasha = "שמיני"
            if (rd >= youd_heth.add(182).abs() && rd < youd_heth.add(189).abs()) parasha = "תזריע-מצורע"
            if (rd >= youd_heth.add(189).abs() && rd < youd_heth.add(196).abs()) parasha = "אחרי מות-קדושים"
            if (rd >= youd_heth.add(196).abs() && rd < youd_heth.add(203).abs()) parasha = "אמר"
            if (rd >= youd_heth.add(203).abs() && rd < youd_heth.add(210).abs()) parasha = "בהר"
            if (rd >= youd_heth.add(210).abs() && rd < youd_heth.add(217).abs()) parasha = "בחוקותי"
            if (rd >= youd_heth.add(217).abs() && rd < youd_heth.add(224).abs()) parasha = "במדבר"
            if (rd >= youd_heth.add(224).abs() && rd < youd_heth.add(231).abs()) parasha = "נשא"
            if (rd >= youd_heth.add(231).abs() && rd < youd_heth.add(238).abs()) parasha = "בהעלתך"
            if (rd >= youd_heth.add(238).abs() && rd < youd_heth.add(245).abs()) parasha = "שלח לך"
            if (rd >= youd_heth.add(245).abs() && rd < youd_heth.add(252).abs()) parasha = "קרח"
            if (rd >= youd_heth.add(252).abs() && rd < youd_heth.add(259).abs()) parasha = "חקת"
            if (rd >= youd_heth.add(259).abs() && rd < youd_heth.add(266).abs()) parasha = "בלק"
            if (rd >= youd_heth.add(266).abs() && rd < youd_heth.add(273).abs()) parasha = "פינחס"
            if (rd >= youd_heth.add(273).abs() && rd < youd_heth.add(280).abs()) parasha = "מטות-מסעי"
            if (rd >= youd_heth.add(280).abs() && rd < youd_heth.add(287).abs()) parasha = "דברים"
            if (rd >= youd_heth.add(287).abs() && rd < youd_heth.add(294).abs()) parasha = "ואתחנן"
            if (rd >= youd_heth.add(294).abs() && rd < youd_heth.add(301).abs()) parasha = "עקב"
            if (rd >= youd_heth.add(301).abs() && rd < youd_heth.add(308).abs()) parasha = "ראה"
            if (rd >= youd_heth.add(308).abs() && rd < youd_heth.add(315).abs()) parasha = "שפטים"
            if (rd >= youd_heth.add(315).abs() && rd < youd_heth.add(322).abs()) parasha = "כי תצא"
            if (rd >= youd_heth.add(322).abs() && rd < youd_heth.add(329).abs()) parasha = "כי תבוא"
            if (rd >= youd_heth.add(329).abs() && rd < youd_heth.add(336).abs()) parasha = "נצבים"
            if (rd >= youd_heth.add(336).abs() && rd < youd_heth.add(343).abs()) parasha = "וילך"
        }
        
        else if (year === 5780 || year === 5783) {
            // שנת תש״פ, תשפ״ג – הצגה של פרשת שבוע
            const alef        = new HDate( 1, 7, year)
            const haazino     = new HDate( 7, 7, year)
            const youd_daleth = new HDate(14, 7, year)
            const kaf_alef    = new HDate(21, 7, year)

            if (rd >= alef.abs()               && rd < haazino.abs())       parasha = "וילך"
            if (rd >= haazino.abs()            && rd < youd_daleth.abs())    parasha = "האזינו"
            if (rd >= youd_daleth.abs()        && rd < kaf_alef.abs())       parasha = "שבת חול המועד"
            if (rd >= kaf_alef.abs()           && rd < kaf_alef.add(7).abs())    parasha = "בראשית"
            if (rd >= kaf_alef.add(7).abs()    && rd < kaf_alef.add(14).abs())   parasha = "נח"
            if (rd >= kaf_alef.add(14).abs()   && rd < kaf_alef.add(21).abs())   parasha = "לך לך"
            if (rd >= kaf_alef.add(21).abs()   && rd < kaf_alef.add(28).abs())   parasha = "וירא"
            if (rd >= kaf_alef.add(28).abs()   && rd < kaf_alef.add(35).abs())   parasha = "חיי שרה"
            if (rd >= kaf_alef.add(35).abs()   && rd < kaf_alef.add(42).abs())   parasha = "תולדות"
            if (rd >= kaf_alef.add(42).abs()   && rd < kaf_alef.add(49).abs())   parasha = "ויצא"
            if (rd >= kaf_alef.add(49).abs()   && rd < kaf_alef.add(56).abs())   parasha = "וישלח"
            if (rd >= kaf_alef.add(56).abs()   && rd < kaf_alef.add(63).abs())   parasha = "וישב"
            if (rd >= kaf_alef.add(63).abs()   && rd < kaf_alef.add(70).abs())   parasha = "מקץ"
            if (rd >= kaf_alef.add(70).abs()   && rd < kaf_alef.add(77).abs())   parasha = "ויגש"
            if (rd >= kaf_alef.add(77).abs()   && rd < kaf_alef.add(84).abs())   parasha = "ויחי"
            if (rd >= kaf_alef.add(84).abs()   && rd < kaf_alef.add(91).abs())   parasha = "שמות"
            if (rd >= kaf_alef.add(91).abs()   && rd < kaf_alef.add(98).abs())   parasha = "וארא"
            if (rd >= kaf_alef.add(98).abs()   && rd < kaf_alef.add(105).abs())  parasha = "בא"
            if (rd >= kaf_alef.add(105).abs()  && rd < kaf_alef.add(112).abs())  parasha = "בשלח"
            if (rd >= kaf_alef.add(112).abs()  && rd < kaf_alef.add(119).abs())  parasha = "יתרו"
            if (rd >= kaf_alef.add(119).abs()  && rd < kaf_alef.add(126).abs())  parasha = "משפטים"
            if (rd >= kaf_alef.add(126).abs()  && rd < kaf_alef.add(133).abs())  parasha = "תרומה"
            if (rd >= kaf_alef.add(133).abs()  && rd < kaf_alef.add(140).abs())  parasha = "תצוה"
            if (rd >= kaf_alef.add(140).abs()  && rd < kaf_alef.add(147).abs())  parasha = "כי תשא"
            if (rd >= kaf_alef.add(147).abs()  && rd < kaf_alef.add(154).abs())  parasha = "ויקהל-פקודי"
            if (rd >= kaf_alef.add(154).abs()  && rd < kaf_alef.add(161).abs())  parasha = "ויקרא"
            if (rd >= kaf_alef.add(161).abs()  && rd < kaf_alef.add(168).abs())  parasha = "צו"
            if (rd >= kaf_alef.add(168).abs()  && rd < kaf_alef.add(175).abs())  parasha = "שבת חול המועד"
            if (rd >= kaf_alef.add(175).abs()  && rd < kaf_alef.add(182).abs())  parasha = "שמיני"
            if (rd >= kaf_alef.add(182).abs()  && rd < kaf_alef.add(189).abs())  parasha = "תזריע-מצורע"
            if (rd >= kaf_alef.add(189).abs()  && rd < kaf_alef.add(196).abs())  parasha = "אחרי מות-קדושים"
            if (rd >= kaf_alef.add(196).abs()  && rd < kaf_alef.add(203).abs())  parasha = "אמר"
            if (rd >= kaf_alef.add(203).abs()  && rd < kaf_alef.add(210).abs())  parasha = "בהר-בחקתי"
            if (rd >= kaf_alef.add(210).abs()  && rd < kaf_alef.add(217).abs())  parasha = "במדבר"
            if (rd >= kaf_alef.add(217).abs()  && rd < kaf_alef.add(224).abs())  parasha = "נשא"
            if (rd >= kaf_alef.add(224).abs()  && rd < kaf_alef.add(231).abs())  parasha = "בהעלתך"
            if (rd >= kaf_alef.add(231).abs()  && rd < kaf_alef.add(238).abs())  parasha = "שלח לך"
            if (rd >= kaf_alef.add(238).abs()  && rd < kaf_alef.add(245).abs())  parasha = "קרח"
            if (rd >= kaf_alef.add(245).abs()  && rd < kaf_alef.add(252).abs())  parasha = "חקת"
            if (rd >= kaf_alef.add(252).abs()  && rd < kaf_alef.add(259).abs())  parasha = "בלק"
            if (rd >= kaf_alef.add(259).abs()  && rd < kaf_alef.add(266).abs())  parasha = "פנחס"
            if (rd >= kaf_alef.add(266).abs()  && rd < kaf_alef.add(273).abs())  parasha = "מטות-מסעי"
            if (rd >= kaf_alef.add(273).abs()  && rd < kaf_alef.add(280).abs())  parasha = "דברים"
            if (rd >= kaf_alef.add(280).abs()  && rd < kaf_alef.add(287).abs())  parasha = "ואתחנן"
            if (rd >= kaf_alef.add(287).abs()  && rd < kaf_alef.add(294).abs())  parasha = "עקב"
            if (rd >= kaf_alef.add(294).abs()  && rd < kaf_alef.add(301).abs())  parasha = "ראה"
            if (rd >= kaf_alef.add(301).abs()  && rd < kaf_alef.add(308).abs())  parasha = "שפטים"
            if (rd >= kaf_alef.add(308).abs()  && rd < kaf_alef.add(315).abs())  parasha = "כי תצא"
            if (rd >= kaf_alef.add(315).abs()  && rd < kaf_alef.add(322).abs())  parasha = "כי תבוא"
            if (rd >= kaf_alef.add(322).abs()  && rd < kaf_alef.add(329).abs())  parasha = "נצבים-וילך"
            if (rd >= kaf_alef.add(329).abs()  && rd < kaf_alef.add(336).abs())  parasha = "וילך"
        }
        
        else if (year === 5773 || year === 5777) {
            // arranger
            // שנת תשע"ג, תשע"ז – הצגה של פרשת שבוע
            const alef       = new HDate( 1, 7, year)
            const haazino    = new HDate( 7, 7, year)
            const youd_daleth= new HDate(14, 7, year)
            const kaf_alef   = new HDate(21, 7, year)

            if (rd >= alef.abs()               && rd < haazino.abs())       parasha = "וילך"
            if (rd >= haazino.abs()            && rd < youd_daleth.abs())    parasha = "האזינו"
            if (rd >= youd_daleth.abs()        && rd < kaf_alef.abs())       parasha = "שבת חול המועד"
            if (rd >= kaf_alef.abs()           && rd < kaf_alef.add(7).abs())    parasha = "בראשית"
            if (rd >= kaf_alef.add(7).abs()    && rd < kaf_alef.add(14).abs())   parasha = "נח"
            if (rd >= kaf_alef.add(14).abs()   && rd < kaf_alef.add(21).abs())   parasha = "לך לך"
            if (rd >= kaf_alef.add(21).abs()   && rd < kaf_alef.add(28).abs())   parasha = "וירא"
            if (rd >= kaf_alef.add(28).abs()   && rd < kaf_alef.add(35).abs())   parasha = "חיי שרה"
            if (rd >= kaf_alef.add(35).abs()   && rd < kaf_alef.add(42).abs())   parasha = "תולדות"
            if (rd >= kaf_alef.add(42).abs()   && rd < kaf_alef.add(49).abs())   parasha = "ויצא"
            if (rd >= kaf_alef.add(49).abs()   && rd < kaf_alef.add(56).abs())   parasha = "וישלח"
            if (rd >= kaf_alef.add(56).abs()   && rd < kaf_alef.add(63).abs())   parasha = "וישב"
            if (rd >= kaf_alef.add(63).abs()   && rd < kaf_alef.add(70).abs())   parasha = "מקץ"
            if (rd >= kaf_alef.add(70).abs()   && rd < kaf_alef.add(77).abs())   parasha = "ויגש"
            if (rd >= kaf_alef.add(77).abs()   && rd < kaf_alef.add(84).abs())   parasha = "ויחי"
            if (rd >= kaf_alef.add(84).abs()   && rd < kaf_alef.add(91).abs())   parasha = "שמות"
            if (rd >= kaf_alef.add(91).abs()   && rd < kaf_alef.add(98).abs())   parasha = "וארא"
            if (rd >= kaf_alef.add(98).abs()   && rd < kaf_alef.add(105).abs())  parasha = "בא"
            if (rd >= kaf_alef.add(105).abs()  && rd < kaf_alef.add(112).abs())  parasha = "בשלח"
            if (rd >= kaf_alef.add(112).abs()  && rd < kaf_alef.add(119).abs())  parasha = "יתרו"
            if (rd >= kaf_alef.add(119).abs()  && rd < kaf_alef.add(126).abs())  parasha = "משפטים"
            if (rd >= kaf_alef.add(126).abs()  && rd < kaf_alef.add(133).abs())  parasha = "תרומה"
            if (rd >= kaf_alef.add(133).abs()  && rd < kaf_alef.add(140).abs())  parasha = "תצוה"
            if (rd >= kaf_alef.add(140).abs()  && rd < kaf_alef.add(147).abs())  parasha = "כי תשא"
            if (rd >= kaf_alef.add(147).abs()  && rd < kaf_alef.add(154).abs())  parasha = "ויקהל-פקודי"
            if (rd >= kaf_alef.add(154).abs()  && rd < kaf_alef.add(161).abs())  parasha = "ויקרא"
            if (rd >= kaf_alef.add(161).abs()  && rd < kaf_alef.add(168).abs())  parasha = "צו"
            if (rd >= kaf_alef.add(168).abs()  && rd < kaf_alef.add(175).abs())  parasha = "שבת חול המועד"
            if (rd >= kaf_alef.add(175).abs()  && rd < kaf_alef.add(182).abs())  parasha = "שמיני"
            if (rd >= kaf_alef.add(182).abs()  && rd < kaf_alef.add(189).abs())  parasha = "תזריע-מצורע"
            if (rd >= kaf_alef.add(189).abs()  && rd < kaf_alef.add(196).abs())  parasha = "אחרי מות-קדושים"
            if (rd >= kaf_alef.add(196).abs()  && rd < kaf_alef.add(203).abs())  parasha = "אמר"
            if (rd >= kaf_alef.add(203).abs()  && rd < kaf_alef.add(210).abs())  parasha = "בהר-בחקתי"
            if (rd >= kaf_alef.add(210).abs()  && rd < kaf_alef.add(217).abs())  parasha = "במדבר"
            if (rd >= kaf_alef.add(217).abs()  && rd < kaf_alef.add(224).abs())  parasha = "נשא"
            if (rd >= kaf_alef.add(224).abs()  && rd < kaf_alef.add(231).abs())  parasha = "בהעלתך"
            if (rd >= kaf_alef.add(231).abs()  && rd < kaf_alef.add(238).abs())  parasha = "שלח לך"
            if (rd >= kaf_alef.add(238).abs()  && rd < kaf_alef.add(245).abs())  parasha = "קרח"
            if (rd >= kaf_alef.add(245).abs()  && rd < kaf_alef.add(252).abs())  parasha = "חקת"
            if (rd >= kaf_alef.add(252).abs()  && rd < kaf_alef.add(259).abs())  parasha = "בלק"
            if (rd >= kaf_alef.add(259).abs()  && rd < kaf_alef.add(266).abs())  parasha = "פנחס"
            if (rd >= kaf_alef.add(266).abs()  && rd < kaf_alef.add(273).abs())  parasha = "מטות-מסעי"
            if (rd >= kaf_alef.add(273).abs()  && rd < kaf_alef.add(280).abs())  parasha = "דברים"
            if (rd >= kaf_alef.add(280).abs()  && rd < kaf_alef.add(287).abs())  parasha = "ואתחנן"
            if (rd >= kaf_alef.add(287).abs()  && rd < kaf_alef.add(294).abs())  parasha = "עקב"
            if (rd >= kaf_alef.add(294).abs()  && rd < kaf_alef.add(301).abs())  parasha = "ראה"
            if (rd >= kaf_alef.add(301).abs()  && rd < kaf_alef.add(308).abs())  parasha = "שפטים"
            if (rd >= kaf_alef.add(308).abs()  && rd < kaf_alef.add(315).abs())  parasha = "כי תצא"
            if (rd >= kaf_alef.add(315).abs()  && rd < kaf_alef.add(322).abs())  parasha = "כי תבוא"
            if (rd >= kaf_alef.add(322).abs()  && rd < kaf_alef.add(329).abs())  parasha = "נצבים-וילך"
            if (rd >= kaf_alef.add(329).abs()  && rd < kaf_alef.add(336).abs())  parasha = "האזינו"
        }
        
        else if (year === 5781) {
            // שנת תשפ"א – arranger
            // הצגה של פרשת שבוע
            const alef       = new HDate( 1, 7, year)
            const haazino    = new HDate( 2, 7, year)
            const teth       = new HDate( 9, 7, year)
            const teth_zain  = new HDate(16, 7, year)
            const kaf_guimel = new HDate(23, 7, year)

            if (rd >= haazino.abs()           && rd < teth.abs())        parasha = "האזינו"
            if (rd >= teth.abs()              && rd < teth_zain.abs())   parasha = " "
            if (rd >= teth_zain.abs()         && rd <= kaf_guimel.abs()) parasha = " "
            if (rd >= kaf_guimel.abs()        && rd < kaf_guimel.add(7).abs())   parasha = "בראשית"
            if (rd >= kaf_guimel.add(7).abs() && rd < kaf_guimel.add(14).abs())  parasha = "נח"
            if (rd >= kaf_guimel.add(14).abs()&& rd < kaf_guimel.add(21).abs())  parasha = "לך לך"
            if (rd >= kaf_guimel.add(21).abs()&& rd < kaf_guimel.add(28).abs())  parasha = "וירא"
            if (rd >= kaf_guimel.add(28).abs()&& rd < kaf_guimel.add(35).abs())  parasha = "חיי שרה"
            if (rd >= kaf_guimel.add(35).abs()&& rd < kaf_guimel.add(42).abs())  parasha = "תולדות"
            if (rd >= kaf_guimel.add(42).abs()&& rd < kaf_guimel.add(49).abs())  parasha = "ויצא"
            if (rd >= kaf_guimel.add(49).abs()&& rd < kaf_guimel.add(56).abs())  parasha = "וישלח"
            if (rd >= kaf_guimel.add(56).abs()&& rd < kaf_guimel.add(63).abs())  parasha = "וישב"
            if (rd >= kaf_guimel.add(63).abs()&& rd < kaf_guimel.add(70).abs())  parasha = "מקץ"
            if (rd >= kaf_guimel.add(70).abs()&& rd < kaf_guimel.add(77).abs())  parasha = "ויגש"
            if (rd >= kaf_guimel.add(77).abs()&& rd < kaf_guimel.add(84).abs())  parasha = "ויחי"
            if (rd >= kaf_guimel.add(84).abs()&& rd < kaf_guimel.add(91).abs())  parasha = "שמות"
            if (rd >= kaf_guimel.add(91).abs()&& rd < kaf_guimel.add(98).abs())  parasha = "וארא"
            if (rd >= kaf_guimel.add(98).abs()&& rd < kaf_guimel.add(105).abs()) parasha = "בא"
            if (rd >= kaf_guimel.add(105).abs()&& rd < kaf_guimel.add(112).abs()) parasha = "בשלח"
            if (rd >= kaf_guimel.add(112).abs()&& rd < kaf_guimel.add(119).abs()) parasha = "יתרו"
            if (rd >= kaf_guimel.add(119).abs()&& rd < kaf_guimel.add(126).abs()) parasha = "משפטים"
            if (rd >= kaf_guimel.add(126).abs()&& rd < kaf_guimel.add(133).abs()) parasha = "תרומה"
            if (rd >= kaf_guimel.add(133).abs()&& rd < kaf_guimel.add(140).abs()) parasha = "תצוה"
            if (rd >= kaf_guimel.add(140).abs()&& rd < kaf_guimel.add(147).abs()) parasha = "כי תשא"
            if (rd >= kaf_guimel.add(147).abs()&& rd < kaf_guimel.add(154).abs()) parasha = "ויקהל-פקודי"
            if (rd >= kaf_guimel.add(154).abs()&& rd < kaf_guimel.add(161).abs()) parasha = "ויקרא"
            if (rd >= kaf_guimel.add(161).abs()&& rd < kaf_guimel.add(168).abs()) parasha = "צו"
            if (rd >= kaf_guimel.add(168).abs()&& rd < kaf_guimel.add(175).abs()) parasha = "שבת חול המועד"
            if (rd >= kaf_guimel.add(175).abs()&& rd < kaf_guimel.add(182).abs()) parasha = "שמיני"
            if (rd >= kaf_guimel.add(182).abs()&& rd < kaf_guimel.add(189).abs()) parasha = "תזריע-מצורע"
            if (rd >= kaf_guimel.add(189).abs()&& rd < kaf_guimel.add(196).abs()) parasha = "אחרי מות-קדושים"
            if (rd >= kaf_guimel.add(196).abs()&& rd < kaf_guimel.add(203).abs()) parasha = "אמר"
            if (rd >= kaf_guimel.add(203).abs()&& rd < kaf_guimel.add(210).abs()) parasha = "בהר-בחקתי"
            if (rd >= kaf_guimel.add(210).abs()&& rd < kaf_guimel.add(217).abs()) parasha = "במדבר"
            if (rd >= kaf_guimel.add(217).abs()&& rd < kaf_guimel.add(224).abs()) parasha = "נשא"
            if (rd >= kaf_guimel.add(224).abs()&& rd < kaf_guimel.add(231).abs()) parasha = "בהעלתך"
            if (rd >= kaf_guimel.add(231).abs()&& rd < kaf_guimel.add(238).abs()) parasha = "שלח לך"
            if (rd >= kaf_guimel.add(238).abs()&& rd < kaf_guimel.add(245).abs()) parasha = "קרח"
            if (rd >= kaf_guimel.add(245).abs()&& rd < kaf_guimel.add(252).abs()) parasha = "חקת"
            if (rd >= kaf_guimel.add(252).abs()&& rd < kaf_guimel.add(259).abs()) parasha = "בלק"
            if (rd >= kaf_guimel.add(259).abs()&& rd < kaf_guimel.add(266).abs()) parasha = "פנחס"
            if (rd >= kaf_guimel.add(266).abs()&& rd < kaf_guimel.add(273).abs()) parasha = "מטות-מסעי"
            if (rd >= kaf_guimel.add(273).abs()&& rd < kaf_guimel.add(280).abs()) parasha = "דברים"
            if (rd >= kaf_guimel.add(280).abs()&& rd < kaf_guimel.add(287).abs()) parasha = "ואתחנן"
            if (rd >= kaf_guimel.add(287).abs()&& rd < kaf_guimel.add(294).abs()) parasha = "עקב"
            if (rd >= kaf_guimel.add(294).abs()&& rd < kaf_guimel.add(301).abs()) parasha = "ראה"
            if (rd >= kaf_guimel.add(301).abs()&& rd < kaf_guimel.add(308).abs()) parasha = "שפטים"
            if (rd >= kaf_guimel.add(308).abs()&& rd < kaf_guimel.add(315).abs()) parasha = "כי תצא"
            if (rd >= kaf_guimel.add(315).abs()&& rd < kaf_guimel.add(322).abs()) parasha = "כי תבוא"
            if (rd >= kaf_guimel.add(322).abs()&& rd < kaf_guimel.add(329).abs()) parasha = "נצבים"
            if (rd >= kaf_guimel.add(329).abs()&& rd < kaf_guimel.add(336).abs()) parasha = "וילך"
        }
        
        else if (year === 5788) {
            // שנת תשפ"ח – הצגה של פרשת שבוע
            const haazino    = new HDate( 2, 7, year)
            const teth       = new HDate( 9, 7, year)
            const teth_zain  = new HDate(16, 7, year)
            const kaf_guimel = new HDate(23, 7, year)

            if (rd >= haazino.abs()           && rd <  teth.abs())        parasha = "האזינו"
            if (rd >= teth.abs()              && rd <  teth_zain.abs())   parasha = " "
            if (rd >= teth_zain.abs()         && rd <= kaf_guimel.abs())  parasha = " "
            if (rd >= kaf_guimel.abs()        && rd <  kaf_guimel.add(7).abs())   parasha = "בראשית"
            if (rd === kaf_guimel.add(7).abs() && rd <  kaf_guimel.add(14).abs())  parasha = "נח"
            if (rd === kaf_guimel.add(14).abs()&& rd <  kaf_guimel.add(21).abs())  parasha = "לך לך"
            if (rd === kaf_guimel.add(21).abs()&& rd <  kaf_guimel.add(28).abs())  parasha = "וירא"
            if (rd === kaf_guimel.add(28).abs()&& rd <  kaf_guimel.add(35).abs())  parasha = "חיי שרה"
            if (rd === kaf_guimel.add(35).abs()&& rd <  kaf_guimel.add(42).abs())  parasha = "תולדות"
            if (rd === kaf_guimel.add(42).abs()&& rd <  kaf_guimel.add(49).abs())  parasha = "ויצא"
            if (rd === kaf_guimel.add(49).abs()&& rd <  kaf_guimel.add(56).abs())  parasha = "וישלח"
            if (rd === kaf_guimel.add(56).abs()&& rd <  kaf_guimel.add(63).abs())  parasha = "וישב"
            if (rd === kaf_guimel.add(63).abs()&& rd <  kaf_guimel.add(70).abs())  parasha = "מקץ"
            if (rd === kaf_guimel.add(70).abs()&& rd <  kaf_guimel.add(77).abs())  parasha = "ויגש"
            if (rd === kaf_guimel.add(77).abs()&& rd <  kaf_guimel.add(84).abs())  parasha = "ויחי"
            if (rd === kaf_guimel.add(84).abs()&& rd <  kaf_guimel.add(91).abs())  parasha = "שמות"
            if (rd === kaf_guimel.add(91).abs()&& rd <  kaf_guimel.add(98).abs())  parasha = "וארא"
            if (rd === kaf_guimel.add(98).abs()&& rd <  kaf_guimel.add(105).abs()) parasha = "בא"
            if (rd === kaf_guimel.add(105).abs()&& rd <  kaf_guimel.add(112).abs()) parasha = "בשלח"
            if (rd === kaf_guimel.add(112).abs()&& rd <  kaf_guimel.add(119).abs()) parasha = "יתרו"
            if (rd === kaf_guimel.add(119).abs()&& rd <  kaf_guimel.add(126).abs()) parasha = "משפטים"
            if (rd === kaf_guimel.add(126).abs()&& rd <  kaf_guimel.add(133).abs()) parasha = "תרומה"
            if (rd === kaf_guimel.add(133).abs()&& rd <  kaf_guimel.add(140).abs()) parasha = "תצוה"
            if (rd === kaf_guimel.add(140).abs()&& rd <  kaf_guimel.add(147).abs()) parasha = "כי תשא"
            if (rd === kaf_guimel.add(147).abs()&& rd <  kaf_guimel.add(154).abs()) parasha = "ויקהל-פקודי"
            if (rd === kaf_guimel.add(154).abs()&& rd <  kaf_guimel.add(161).abs()) parasha = "ויקרא"
            if (rd === kaf_guimel.add(161).abs()&& rd <  kaf_guimel.add(168).abs()) parasha = "צו"
            if (rd === kaf_guimel.add(168).abs()&& rd <  kaf_guimel.add(175).abs()) parasha = "שבת חול המועד"
            if (rd === kaf_guimel.add(175).abs()&& rd <  kaf_guimel.add(182).abs()) parasha = "שמיני"
            if (rd === kaf_guimel.add(182).abs()&& rd <  kaf_guimel.add(189).abs()) parasha = "תזריע-מצורע"
            if (rd === kaf_guimel.add(189).abs()&& rd <  kaf_guimel.add(196).abs()) parasha = "אחרי מות-קדושים"
            if (rd === kaf_guimel.add(196).abs()&& rd <  kaf_guimel.add(203).abs()) parasha = "אמר"
            if (rd === kaf_guimel.add(203).abs()&& rd <  kaf_guimel.add(210).abs()) parasha = "בהר-בחקתי"
            if (rd === kaf_guimel.add(210).abs()&& rd <  kaf_guimel.add(217).abs()) parasha = "במדבר"
            if (rd === kaf_guimel.add(217).abs()&& rd <  kaf_guimel.add(224).abs()) parasha = "נשא"
            if (rd === kaf_guimel.add(224).abs()&& rd <  kaf_guimel.add(231).abs()) parasha = "בהעלתך"
            if (rd === kaf_guimel.add(231).abs()&& rd <  kaf_guimel.add(238).abs()) parasha = "שלח לך"
            if (rd === kaf_guimel.add(238).abs()&& rd <  kaf_guimel.add(245).abs()) parasha = "קרח"
            if (rd === kaf_guimel.add(245).abs()&& rd <  kaf_guimel.add(252).abs()) parasha = "חקת"
            if (rd === kaf_guimel.add(252).abs()&& rd <  kaf_guimel.add(259).abs()) parasha = "בלק"
            if (rd === kaf_guimel.add(259).abs()&& rd <  kaf_guimel.add(266).abs()) parasha = "פנחס"
            if (rd === kaf_guimel.add(266).abs()&& rd <  kaf_guimel.add(273).abs()) parasha = "מטות-מסעי"
            if (rd === kaf_guimel.add(273).abs()&& rd <  kaf_guimel.add(280).abs()) parasha = "דברים"
            if (rd === kaf_guimel.add(280).abs()&& rd <  kaf_guimel.add(287).abs()) parasha = "ואתחנן"
            if (rd === kaf_guimel.add(287).abs()&& rd <  kaf_guimel.add(294).abs()) parasha = "עקב"
            if (rd === kaf_guimel.add(294).abs()&& rd <  kaf_guimel.add(301).abs()) parasha = "ראה"
            if (rd === kaf_guimel.add(301).abs()&& rd <  kaf_guimel.add(308).abs()) parasha = "שפטים"
            if (rd === kaf_guimel.add(308).abs()&& rd <  kaf_guimel.add(315).abs()) parasha = "כי תצא"
            if (rd === kaf_guimel.add(315).abs()&& rd <  kaf_guimel.add(322).abs()) parasha = "כי תבוא"
            if (rd === kaf_guimel.add(322).abs()&& rd <  kaf_guimel.add(329).abs()) parasha = "נצבים-וילך"
            if (rd === kaf_guimel.add(329).abs()&& rd <  kaf_guimel.add(336).abs()) parasha = "האזינו"
        }
        
        else if (year === 5785) {
            // שנת תשפ"ה – הצגה של פרשת שבוע
            const alef      = new HDate( 1, 7, year)
            const daleth    = new HDate( 4, 7, year)
            const youd_alef = new HDate(11, 7, year)
            const youd_heth = new HDate(18, 7, year)

            if (rd >= alef.abs()               && rd < daleth.abs())    parasha = "האזינו"
            if (rd >= daleth.abs()             && rd < youd_alef.abs()) parasha = " "
            if (rd >= youd_alef.abs()          && rd < youd_heth.abs()) parasha = "שבת חול המועד"
            if (rd >= youd_heth.abs()          && rd < youd_heth.add(7).abs())  parasha = "בראשית"
            if (rd >= youd_heth.add(7).abs()   && rd < youd_heth.add(14).abs()) parasha = "נח"
            if (rd >= youd_heth.add(14).abs()  && rd < youd_heth.add(21).abs()) parasha = "לך לך"
            if (rd >= youd_heth.add(21).abs()  && rd < youd_heth.add(28).abs()) parasha = "וירא"
            if (rd >= youd_heth.add(28).abs()  && rd < youd_heth.add(35).abs()) parasha = "חיי שרה"
            if (rd >= youd_heth.add(35).abs()  && rd < youd_heth.add(42).abs()) parasha = "תולדות"
            if (rd >= youd_heth.add(42).abs()  && rd < youd_heth.add(49).abs()) parasha = "ויצא"
            if (rd >= youd_heth.add(49).abs()  && rd < youd_heth.add(56).abs()) parasha = "וישלח"
            if (rd >= youd_heth.add(56).abs()  && rd < youd_heth.add(63).abs()) parasha = "וישב"
            if (rd >= youd_heth.add(63).abs()  && rd < youd_heth.add(70).abs()) parasha = "מקץ"
            if (rd >= youd_heth.add(70).abs()  && rd < youd_heth.add(77).abs()) parasha = "ויגש"
            if (rd >= youd_heth.add(77).abs()  && rd < youd_heth.add(84).abs()) parasha = "ויחי"
            if (rd >= youd_heth.add(84).abs()  && rd < youd_heth.add(91).abs()) parasha = "שמות"
            if (rd >= youd_heth.add(91).abs()  && rd < youd_heth.add(98).abs()) parasha = "וארא"
            if (rd >= youd_heth.add(98).abs()  && rd < youd_heth.add(105).abs()) parasha = "בא"
            if (rd >= youd_heth.add(105).abs() && rd < youd_heth.add(112).abs()) parasha = "בשלח"
            if (rd >= youd_heth.add(112).abs() && rd < youd_heth.add(119).abs()) parasha = "יתרו"
            if (rd >= youd_heth.add(119).abs() && rd < youd_heth.add(126).abs()) parasha = "משפטים"
            if (rd >= youd_heth.add(126).abs() && rd < youd_heth.add(133).abs()) parasha = "תרומה"
            if (rd >= youd_heth.add(133).abs() && rd < youd_heth.add(140).abs()) parasha = "תצוה"
            if (rd >= youd_heth.add(140).abs() && rd < youd_heth.add(147).abs()) parasha = "כי תשא"
            if (rd >= youd_heth.add(147).abs() && rd < youd_heth.add(154).abs()) parasha = "ויקהל"
            if (rd >= youd_heth.add(154).abs() && rd < youd_heth.add(161).abs()) parasha = "פקודי"
            if (rd >= youd_heth.add(161).abs() && rd < youd_heth.add(168).abs()) parasha = "ויקרא"
            if (rd >= youd_heth.add(168).abs() && rd < youd_heth.add(175).abs()) parasha = "צו"
            if (rd >= youd_heth.add(175).abs() && rd < youd_heth.add(182).abs()) parasha = "שבת חול המועד"
            if (rd >= youd_heth.add(182).abs() && rd < youd_heth.add(189).abs()) parasha = "שמיני"
            if (rd >= youd_heth.add(189).abs() && rd < youd_heth.add(196).abs()) parasha = "תזריע-מצורע"
            if (rd >= youd_heth.add(196).abs() && rd < youd_heth.add(203).abs()) parasha = "אחרי מות-קדושים"
            if (rd >= youd_heth.add(203).abs() && rd < youd_heth.add(210).abs()) parasha = "אמר"
            if (rd >= youd_heth.add(210).abs() && rd < youd_heth.add(217).abs()) parasha = "בהר-בחוקותי"
            if (rd >= youd_heth.add(217).abs() && rd < youd_heth.add(224).abs()) parasha = "במדבר"
            if (rd >= youd_heth.add(224).abs() && rd < youd_heth.add(231).abs()) parasha = "נשא"
            if (rd >= youd_heth.add(231).abs() && rd < youd_heth.add(238).abs()) parasha = "בהעלתך"
            if (rd >= youd_heth.add(238).abs() && rd < youd_heth.add(245).abs()) parasha = "שלח לך"
            if (rd >= youd_heth.add(245).abs() && rd < youd_heth.add(252).abs()) parasha = "קרח"
            if (rd >= youd_heth.add(252).abs() && rd < youd_heth.add(259).abs()) parasha = "חקת"
            if (rd >= youd_heth.add(259).abs() && rd < youd_heth.add(266).abs()) parasha = "בלק"
            if (rd >= youd_heth.add(266).abs() && rd < youd_heth.add(273).abs()) parasha = "פינחס"
            if (rd >= youd_heth.add(273).abs() && rd < youd_heth.add(280).abs()) parasha = "מטות-מסעי"
            if (rd >= youd_heth.add(280).abs() && rd < youd_heth.add(287).abs()) parasha = "דברים"
            if (rd >= youd_heth.add(287).abs() && rd < youd_heth.add(294).abs()) parasha = "ואתחנן"
            if (rd >= youd_heth.add(294).abs() && rd < youd_heth.add(301).abs()) parasha = "עקב"
            if (rd >= youd_heth.add(301).abs() && rd < youd_heth.add(308).abs()) parasha = "ראה"
            if (rd >= youd_heth.add(308).abs() && rd < youd_heth.add(315).abs()) parasha = "שפטים"
            if (rd >= youd_heth.add(315).abs() && rd < youd_heth.add(322).abs()) parasha = "כי תצא"
            if (rd >= youd_heth.add(322).abs() && rd < youd_heth.add(329).abs()) parasha = "כי תבוא"
            if (rd >= youd_heth.add(329).abs() && rd < youd_heth.add(336).abs()) parasha = "נצבים"
            if (rd >= youd_heth.add(336).abs() && rd < youd_heth.add(343).abs()) parasha = "וילך"
        }        
        else if (year === 5786) {
            // שנת תשפ"ו – הצגה של פרשת שבוע
            const alef        = new HDate( 1, 7, year)
            const haazino     = new HDate( 6, 7, year)
            const youd_guimel = new HDate(13, 7, year)
            const kaf         = new HDate(20, 7, year)

            if (rd >= alef.abs()               && rd <  haazino.abs())       parasha = "וילך"
            if (rd >= haazino.abs()            && rd <  youd_guimel.abs())   parasha = "האזינו"
            if (rd >= youd_guimel.abs()        && rd <  kaf.abs())           parasha = "שבת חול המועד"
            if (rd >= kaf.abs()                && rd <  kaf.add(7).abs())    parasha = "בראשית"
            if (rd >= kaf.add(7).abs()         && rd <  kaf.add(14).abs())   parasha = "נח"
            if (rd >= kaf.add(14).abs()        && rd <  kaf.add(21).abs())   parasha = "לך לך"
            if (rd >= kaf.add(21).abs()        && rd <  kaf.add(28).abs())   parasha = "וירא"
            if (rd >= kaf.add(28).abs()        && rd <  kaf.add(35).abs())   parasha = "חיי שרה"
            if (rd >= kaf.add(35).abs()        && rd <  kaf.add(42).abs())   parasha = "תולדות"
            if (rd >= kaf.add(42).abs()        && rd <  kaf.add(49).abs())   parasha = "ויצא"
            if (rd >= kaf.add(49).abs()        && rd <  kaf.add(56).abs())   parasha = "וישלח"
            if (rd >= kaf.add(56).abs()        && rd <  kaf.add(63).abs())   parasha = "וישב"
            if (rd >= kaf.add(63).abs()        && rd <  kaf.add(70).abs())   parasha = "מקץ"
            if (rd >= kaf.add(70).abs()        && rd <  kaf.add(77).abs())   parasha = "ויגש"
            if (rd >= kaf.add(77).abs()        && rd <  kaf.add(84).abs())   parasha = "ויחי"
            if (rd >= kaf.add(84).abs()        && rd <  kaf.add(91).abs())   parasha = "שמות"
            if (rd >= kaf.add(91).abs()        && rd <  kaf.add(98).abs())   parasha = "וארא"
            if (rd >= kaf.add(98).abs()        && rd <  kaf.add(105).abs())  parasha = "בא"
            if (rd >= kaf.add(105).abs()       && rd <  kaf.add(112).abs())  parasha = "בשלח"
            if (rd >= kaf.add(112).abs()       && rd <  kaf.add(119).abs())  parasha = "יתרו"
            if (rd >= kaf.add(119).abs()       && rd <  kaf.add(126).abs())  parasha = "משפטים"
            if (rd >= kaf.add(126).abs()       && rd <  kaf.add(133).abs())  parasha = "תרומה"
            if (rd >= kaf.add(133).abs()       && rd <  kaf.add(140).abs())  parasha = "תצוה"
            if (rd >= kaf.add(140).abs()       && rd <  kaf.add(147).abs())  parasha = "כי תשא"
            if (rd >= kaf.add(147).abs()       && rd <  kaf.add(154).abs())  parasha = "ויקהל-פקודי"
            if (rd >= kaf.add(154).abs()       && rd <  kaf.add(161).abs())  parasha = "ויקרא"
            if (rd >= kaf.add(161).abs()       && rd <  kaf.add(168).abs())  parasha = "צו"
            if (rd >= kaf.add(168).abs()       && rd <  kaf.add(175).abs())  parasha = "שבת חול המועד"
            if (rd >= kaf.add(175).abs()       && rd <  kaf.add(182).abs())  parasha = "שמיני"
            if (rd >= kaf.add(182).abs()       && rd <  kaf.add(189).abs())  parasha = "תזריע-מצורע"
            if (rd >= kaf.add(189).abs()       && rd <  kaf.add(196).abs())  parasha = "אחרי מות-קדושים"
            if (rd >= kaf.add(196).abs()       && rd <  kaf.add(203).abs())  parasha = "אמר"
            if (rd >= kaf.add(203).abs()       && rd <  kaf.add(210).abs())  parasha = "בהר-בחקתי"
            if (rd >= kaf.add(210).abs()       && rd <  kaf.add(217).abs())  parasha = "במדבר"
            if (rd >= kaf.add(217).abs()       && rd <  kaf.add(224).abs())  parasha = "נשא"
            if (rd >= kaf.add(224).abs()       && rd <  kaf.add(231).abs())  parasha = "בהעלתך"
            if (rd >= kaf.add(231).abs()       && rd <  kaf.add(238).abs())  parasha = "שלח לך"
            if (rd >= kaf.add(238).abs()       && rd <  kaf.add(245).abs())  parasha = "קרח"
            if (rd >= kaf.add(245).abs()       && rd <  kaf.add(252).abs())  parasha = "חקת"
            if (rd >= kaf.add(252).abs()       && rd <  kaf.add(259).abs())  parasha = "בלק"
            if (rd >= kaf.add(259).abs()       && rd <  kaf.add(266).abs())  parasha = "פנחס"
            if (rd >= kaf.add(266).abs()       && rd <  kaf.add(273).abs())  parasha = "מטות-מסעי"
            if (rd >= kaf.add(273).abs()       && rd <  kaf.add(280).abs())  parasha = "דברים"
            if (rd >= kaf.add(280).abs()       && rd <  kaf.add(287).abs())  parasha = "ואתחנן"
            if (rd >= kaf.add(287).abs()       && rd <  kaf.add(294).abs())  parasha = "עקב"
            if (rd >= kaf.add(294).abs()       && rd <  kaf.add(301).abs())  parasha = "ראה"
            if (rd >= kaf.add(301).abs()       && rd <  kaf.add(308).abs())  parasha = "שפטים"
            if (rd >= kaf.add(308).abs()       && rd <  kaf.add(315).abs())  parasha = "כי תצא"
            if (rd >= kaf.add(315).abs()       && rd <  kaf.add(322).abs())  parasha = "כי תבוא"
            if (rd >= kaf.add(322).abs()       && rd <  kaf.add(329).abs())  parasha = "נצבים-וילך"
            if (rd >= kaf.add(329).abs()       && rd <  kaf.add(336).abs())  parasha = " "
        }        
    }

    return parasha
}
