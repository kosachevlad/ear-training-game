import React, { useState, useEffect } from "react";
import * as Tone from "tone";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from "vexflow";
// import { Cello, Violin } from "tonejs-instruments";

// const NOTES = ["A3", "B3", "C4", "D4", "E4", "F#4", "G#4", "A4", "G4", "F4", "E4", "D4", "C4", "B3", "A3"];
const NOTES = [ "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

const DETUNE_LEVELS = [25]; // Cent deviation

const EarTrainingGame = () => {
  const [detunedNotes, setDetunedNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    generateDetunedNotes();
  }, []);

  useEffect(() => {
    renderSheetMusic();
  }, [detunedNotes]);

  const generateDetunedNotes = () => {
    let detuned = NOTES.map(note => ({ note, deviation: 0 }));
    const index = Math.floor(Math.random() * (detuned.length - 1)) + 1;
    const deviation = DETUNE_LEVELS[Math.floor(Math.random() * DETUNE_LEVELS.length)];
    const direction = Math.random() > 0.5 ? "sharp" : "flat";
    
    detuned[index].deviation = direction === "sharp" ? deviation : -deviation;
    setDetunedNotes(detuned);
  };

  const playScale = async () => {
    const synth = new Tone.Synth().toDestination();
    for (let note of detunedNotes) {
      const freq = Tone.Frequency(note.note).toFrequency();
      synth.triggerAttackRelease(freq * Math.pow(2, note.deviation / 1200), "1");
      await new Promise(res => setTimeout(res, 1000));
    }
  };

  const handleNoteSelection = (note) => {
    setSelectedNote(note);
    const incorrect = detunedNotes.find((n) => n.deviation !== 0);
    if (note === incorrect.note) {
      setFeedback("Correct!");
      setScore(score + 1);
    } else {
      setFeedback("Try Again");
    }
  };

  const renderSheetMusic = () => {
    const div = document.getElementById("sheet");
    if (!div) return;
    div.innerHTML = "";
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(400, 150);
    const context = renderer.getContext();
    const stave = new Stave(10, 40, 380);
    stave.addClef("treble").setContext(context).draw();
    
    const notes = detunedNotes.map(n => {
      let [letter, octave] = n.note.match(/[A-G]#?|\d+/g);
      let staveNote = new StaveNote({
        clef: "treble",
        keys: [`${letter}/${octave}`],
        duration: "q",
      });
      
      if (n.note.includes("#")) {
        staveNote.addModifier(new Accidental("#"));
      }
      return staveNote;
    });
    
    if (notes.length === 0) return;
    
    const voice = new Voice({ num_beats: notes.length, beat_value: 4 }).setStrict(false);
    voice.addTickables(notes);
    
    new Formatter().joinVoices([voice]).format([voice], 350);
    voice.draw(context, stave);
  };

  return (
    <div>
      <h2>Ear Training Game</h2>
      <button onClick={playScale}>Play Scale</button>
      <div id="sheet"></div>
      <div className="piano">
        {NOTES.map((note) => (
          <button key={note} className="key" onClick={() => handleNoteSelection(note)}>{note}</button>
        ))}
      </div>
      {feedback && <p>{feedback}</p>}
      <p>Score: {score}</p>
    </div>
  );
};

export default EarTrainingGame;
