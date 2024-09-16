import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import ACTIONS from '../Actions';


const CodeMirrorComponent = ({ language, onChange, initialDoc, socketRef, roomId }) => {
    const editorRef = useRef(null);
    const editorViewRef = useRef(null);

    useEffect(() => {
        const setupCodeMirror = () => {
            const state = EditorState.create({
                doc: initialDoc,
                extensions: [
                    basicSetup,
                    language === 'javascript' ? javascript() : cpp(),

                    EditorView.updateListener.of((update) => {
                        if (update.changes) {
                            const doc = update.state.doc.toString();
                            onChange(doc);
                            if (update.transactions.some(tr => tr.isUserEvent('input'))) {
                                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                                    roomId,
                                    code: doc
                                })
                            }
                        }
                    }),
                ],
            });

            editorViewRef.current = new EditorView({
                state,
                parent: editorRef.current,
            });

            return () => {
                editorViewRef.current.destroy();
            };
        };

        if (editorRef.current) {
            const cleanup = setupCodeMirror();

            return () => {
                cleanup();
            };
        }
    }, [initialDoc, language, onChange, socketRef, roomId]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
                if (editorViewRef.current) {
                    const update = editorViewRef.current.state.update({
                        changes: {
                            from: 0,
                            to: editorViewRef.current.state.doc.length,
                            insert: code,
                        },
                    });
                    editorViewRef.current.update([update]);
                }
            })
        };
        return () => {
            if (socketRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                socketRef.current.off(ACTIONS.SYNC_CODE);
            }
        }
    },[socketRef]);

    return <div ref={editorRef} className='CodeMirror' style={{ height: '100%', width: '100%', fontFamily: "JetBrains Mono" }}></div>;
};

export default CodeMirrorComponent;
