/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import Select from 'react-select';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    // const codeRef = useRef('');
    const [selectedLang, setSelectedLang] = useState('javascript');
    const options = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'clike', label: 'C++' },
        { value: 'python', label: 'Python' },
    ];

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: `${selectedLang}`, json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,

                }
            );

            editorRef.current.on('change', (instance, changes) => {
                // console.log('changes', changes);
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });



        }
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                // console.log('recieiving', code);
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE);
            }

        };
    }, [socketRef.current]);

    return (
        <>
            <h1 className='text-center text-2xl font-bold'>Code Editor</h1>
            <div className="codeEditor">
                <Select defaultValue={selectedLang}
                    onChange={setSelectedLang}
                    options={options}>
                </Select>
                <textarea id="realtimeEditor"></textarea>
            </div>
        </>
    );
};

export default Editor;
