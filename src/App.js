/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react"; import * as Tone from "tone"; import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from "vexflow";

const SCALES = { "C Major": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"], "D Major": ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"], "E Major": ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"], "F Major": ["F3", "G3", "A3", "Bb3", "C4", "D4", "E4", "F4"], "G Major": ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"], "A Major": ["A3", "B3", "C#4", "D4", "E4", "F#4", "G#4", "A4"], "B Major": ["B3", "C#4", "D#4", "E4", "F#4", "G#4", "A#4", "B4"], "A Minor": ["A3", "B3", "C4", "D4", "E4", "F#4", "G#4", "A4"], };

const EarTrainingGame = () => { const [selectedScale, setSelectedScale] = useState("C Major"); const [notes, setNotes] = useState(SCALES[selectedScale]); const [detunedNotes, setDetunedNotes] = useState([]); const [feedback, setFeedback] = useState(null); const [score, setScore] = useState(0); const [synth, setSynth] = useState(null); const [deviationLevel, setDeviationLevel] = useState(30);

useEffect(() => { setNotes(SCALES[selectedScale]); }, [selectedScale]);

useEffect(() => { generateDetunedNotes(); }, [notes, deviationLevel]);

useEffect(() => { renderSheetMusic(); }, [detunedNotes]);

const generateDetunedNotes = () => { let detuned = notes.map(note => ({ note, deviation: 0 })); const index = Math.floor(Math.random() * (detuned.length - 1)) + 1; const direction = Math.random() > 0.5 ? "sharp" : "flat";

detuned[index].deviation = direction === "sharp" ? deviationLevel : -deviationLevel;
setDetunedNotes(detuned);

};

const stopPlayback = () => { if (synth) { synth.dispose(); setSynth(null); } };

const playScale = async () => { stopPlayback(); const newSynth = new Tone.Synth().toDestination(); setSynth(newSynth);

for (let note of detunedNotes) {
  const freq = Tone.Frequency(note.note).toFrequency();
  newSynth.triggerAttackRelease(freq * Math.pow(2, note.deviation / 1200), "1");
  await new Promise(res => setTimeout(res, 1000));
}

};

const handleNoteSelection = async (note) => { const incorrect = detunedNotes.find((n) => n.deviation !== 0); if (note === incorrect.note) { setFeedback("Correct!"); setScore(score + 1);

stopPlayback();
  const newSynth = new Tone.Synth().toDestination();
  newSynth.triggerAttackRelease(Tone.Frequency(incorrect.note).toFrequency() * Math.pow(2, incorrect.deviation / 1200), "1");
  await new Promise(res => setTimeout(res, 1000));
  newSynth.triggerAttackRelease(Tone.Frequency(incorrect.note).toFrequency(), "1");
} else {
  setFeedback("Try Again");
}

};

const renderSheetMusic = () => { const div = document.getElementById("sheet"); if (!div) return; div.innerHTML = ""; const renderer = new Renderer(div, Renderer.Backends.SVG); renderer.resize(420, 150); const context = renderer.getContext(); const stave = new Stave(10, 40, 400); stave.addClef("treble").setContext(context).draw();

const notes = detunedNotes.map(n => {
  let [letter, accidental, octave] = n.note.match(/([A-G])(#|b)?(\d+)/).slice(1);
  let staveNote = new StaveNote({
    clef: "treble",
    keys: [`${letter}${accidental || ""}/${octave}`],
    duration: "q",
  });
  
  if (accidental) {
    staveNote.addModifier(new Accidental(accidental));
  }
  return staveNote;
});

if (notes.length === 0) return;

const voice = new Voice({ num_beats: notes.length, beat_value: 4 }).setStrict(false);
voice.addTickables(notes);

new Formatter().joinVoices([voice]).format([voice], 350);
voice.draw(context, stave);

};

return ( <div> <h2>Ear Training Game</h2> <label>Select deviationLevel: </label> <select onChange={(e) => setDeviationLevel(Number(e.target.value))} value={deviationLevel}> {[40, 35, 30, 25, 20, 15, 10].map(scale => ( <option key={scale} value={scale}>{scale}</option> ))} </select> <br /> <br /> <label>Select Scale: </label> <select onChange={(e) => setSelectedScale(e.target.value)} value={selectedScale}> {Object.keys(SCALES).map(scale => ( <option key={scale} value={scale}>{scale}</option> ))} </select> <button onClick={playScale}>Play Scale</button> <button onClick={stopPlayback}>Stop</button> <div id="sheet"></div> <div className="piano"> {notes.map((note) => ( <button key={note} className="key" onClick={() => handleNoteSelection(note)}>{note}</button> ))} </div> {feedback && <p>{feedback}</p>} <p>Score: {score}</p> </div> ); };

export default EarTrainingGame;

