import { QuizQuestion } from '../types';

export const CEFR_B2_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Despite the intense pressure during the tournament, the champion managed to keep her ______ and execute the final move flawlessly.",
    hint: "สำนวนภาษาอังกฤษหมายถึง 'ควบคุมสติ / อารมณ์ให้สงบนิ่ง' ในสถานการณ์ตึงเครียด",
    options: [
      "A) composure",
      "B) compassion",
      "C) competence",
      "D) comprehension"
    ],
    correctIndex: 0,
    explanation: "✅ คำตอบคือ A) composure ('keep one's composure' แปลว่า รักษาความสงบ/ควบคุมสติ) ส่วน compassion = ความเห็นอกเห็นใจ, competence = ความสามารถ, comprehension = ความเข้าใจ"
  },
  {
    id: 2,
    question: "Had the team ______ the warning earlier, the disastrous accident could have been easily avoided.",
    hint: "Conditional Sentence แบบที่ 3 (Inversion) รูปย่อของ If the team had...",
    options: [
      "A) heed",
      "B) heeded",
      "C) heeding",
      "D) was heeding"
    ],
    correctIndex: 1,
    explanation: "✅ คำตอบคือ B) heeded เพราะเป็นโครงสร้าง Inversion ของ Third Conditional: 'Had + Subject + V.3' (heed = เชื่อฟัง/ใส่ใจคำเตือน)"
  },
  {
    id: 3,
    question: "The scientist’s groundbreaking theory was initially met with widespread skepticism, but subsequent experiments fully ______ its validity.",
    hint: "คำกริยาที่แปลว่า 'ยืนยัน / สนับสนุนข้อเท็จจริง' (Synonym: confirm, verify)",
    options: [
      "A) undermined",
      "B) deteriorated",
      "C) substantiated",
      "D) relinquished"
    ],
    correctIndex: 2,
    explanation: "✅ คำตอบคือ C) substantiated แปลว่า 'พิสูจน์หรือหาหลักฐานมายืนยัน' ส่วน undermined = บั่นทอน, deteriorated = เสื่อมลง, relinquished = สละสิทธิ์/ยอมแพ้"
  },
  {
    id: 4,
    question: "The local government has decided to ______ strict regulations on industrial waste disposal starting next month.",
    hint: "กริยาที่แปลว่า 'บังคับใช้ (กฎหมาย/มาตรการ)' (Collocation: ... regulations / taxes on)",
    options: [
      "A) impose",
      "B) expose",
      "C) compose",
      "D) dispose"
    ],
    correctIndex: 0,
    explanation: "✅ คำตอบคือ A) impose ('impose regulations on...' = กำหนดหรือบังคับใช้กฎระเบียบ) ส่วน expose = เปิดเผย, compose = ประกอบขึ้น, dispose = กำจัด"
  },
  {
    id: 5,
    question: "The museum’s new digital archive will make rare ancient manuscripts ______ to scholars around the world.",
    hint: "คำคุณศัพท์ที่แปลว่า 'สามารถเข้าถึงได้ / เข้าชมได้สะดวก'",
    options: [
      "A) eligible",
      "B) accessible",
      "C) plausible",
      "D) susceptible"
    ],
    correctIndex: 1,
    explanation: "✅ คำตอบคือ B) accessible (accessible to = สามารถเข้าถึงได้) ส่วน eligible = มีสิทธิ์/ผ่านคุณสมบัติ, plausible = สมเหตุสมผล, susceptible = อ่อนไหว/ติดโรคง่าย"
  },
  {
    id: 6,
    question: "It is crucial that every candidate ______ on time for the entrance examination tomorrow morning.",
    hint: "Subjunctive Mood หลัง 'It is crucial / vital / essential that + Subject + V.infinitive'",
    options: [
      "A) arrives",
      "B) will arrive",
      "C) arrive",
      "D) is arriving"
    ],
    correctIndex: 2,
    explanation: "✅ คำตอบคือ C) arrive เพราะอยู่ในรูป Present Subjunctive: 'It is crucial that + S + (should) + V.infinitive (กริยารูปเดิมไม่ผัน)'"
  },
  {
    id: 7,
    question: "The newly appointed CEO promised to tackle the company's financial crisis ______ rather than delaying the difficult decisions.",
    hint: "สำนวนกริยาวิเศษณ์หมายถึง 'เผชิญหน้าหรือจัดการปัญหาโดยตรง' (directly)",
    options: [
      "A) head-on",
      "B) off-hand",
      "C) hand-to-mouth",
      "D) back-to-back"
    ],
    correctIndex: 0,
    explanation: "✅ คำตอบคือ A) head-on ('tackle something head-on' แปลว่า จัดการปัญหาอย่างตรงไปตรงมา/ไม่หลบเลี่ยง) ส่วน off-hand = ทันทีโดยไม่คิด, hand-to-mouth = หาเช้ากินค่ำ"
  },
  {
    id: 8,
    question: "Renewable energy technologies have advanced so rapidly that solar panels are now economically ______ for ordinary households.",
    hint: "คำคุณศัพท์ที่แปลว่า 'สามารถทำได้จริง / มีศักยภาพที่จะอยู่รอดได้ในทางปฏิบัติ'",
    options: [
      "A) vulnerable",
      "B) viable",
      "C) hostile",
      "D) volatile"
    ],
    correctIndex: 1,
    explanation: "✅ คำตอบคือ B) viable ('economically viable' = คุ้มค่าและเป็นไปได้จริงในทางเศรษฐกิจ) ส่วน vulnerable = เปราะบาง, hostile = เป็นศัตรู, volatile = ผันผวนง่าย"
  },
  {
    id: 9,
    question: "No sooner had the keynote speaker stepped onto the stage ______ the audience erupted into thunderous applause.",
    hint: "โครงสร้าง Correlative Conjunction คู่กับ 'No sooner had... ______'",
    options: [
      "A) when",
      "B) than",
      "C) that",
      "D) then"
    ],
    correctIndex: 1,
    explanation: "✅ คำตอบคือ B) than โครงสร้างไวยากรณ์คู่แท้คือ 'No sooner had + S + V.3 + THAN + S + V.2' (ทันทีที่...ก็...)"
  },
  {
    id: 10,
    question: "The director's subtle use of lighting serves to ______ the melancholic atmosphere of the film's climax.",
    hint: "คำกริยาที่แปลว่า 'เน้นย้ำ / ขับเน้นให้เด่นชัดยิ่งขึ้น' (Synonym: accentuate, emphasize)",
    options: [
      "A) heighten",
      "B) hinder",
      "C) halt",
      "D) humble"
    ],
    correctIndex: 0,
    explanation: "✅ คำตอบคือ A) heighten แปลว่า 'เพิ่มพูน / ขับเน้นอารมณ์ให้เข้มข้นขึ้น' ส่วน hinder = ขัดขวาง, halt = หยุดยั้ง, humble = ทำให้อ่อนน้อม"
  }
];
