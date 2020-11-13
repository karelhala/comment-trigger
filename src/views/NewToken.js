import React, { useState } from 'react';
import {
    Stack,
    StackItem,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    ActionGroup,
    TextInput,
    Popover,
    Button,
    ClipboardCopy,
    ClipboardCopyVariant,
} from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/js/icons/help-icon';
import fetch from 'node-fetch';

const NewToken = () => {
    const [selectedType, setSelectedType] = useState('github');
    const [formState, setFormState] = useState({
        'user-name': '',
        'repo-slug': '',
        secret: '',
    });
    const [encoded, setEncoded] = useState('');
    return (
        <Stack hasGutter>
            <StackItem isFilled>
                <Form>
                    <FormGroup
                        label="User name"
                        isRequired
                        fieldId="user-name"
                        helperText="Please provide username to use"
                        labelIcon={
                            <Popover bodyContent="We will not store this token on our server, just encrypt it and store the keys for decryption. Keys are randomly generated, if you loose the encrypted value we are unable to encrypt it again.">
                                <button
                                    aria-label="More info for name field"
                                    onClick={(e) => e.preventDefault()}
                                    aria-describedby="user-name"
                                    className="pf-c-form__group-label-help"
                                >
                                    <HelpIcon noVerticalAlign />
                                </button>
                            </Popover>
                        }
                    >
                        <TextInput
                            isRequired
                            type="text"
                            id="user-name"
                            name="user-name"
                            aria-describedby="user-name"
                            value={formState['user-name']}
                            onChange={(val) =>
                                setFormState({
                                    ...formState,
                                    'user-name': val,
                                })
                            }
                        />
                    </FormGroup>
                    <FormGroup label="Repo slug" fieldId="repo-slug" helperText="Please provide repo slug in format {owner}/{repo}">
                        <TextInput
                            type="text"
                            id="repo-slug"
                            name="repo-slug"
                            aria-describedby="repo-slug"
                            value={formState['repo-slug']}
                            onChange={(val) =>
                                setFormState({
                                    ...formState,
                                    'repo-slug': val,
                                })
                            }
                        />
                    </FormGroup>
                    <FormGroup label="type" fieldId="token-type" helperText="Please select token type to be used">
                        <FormSelect value={selectedType} onChange={(value) => setSelectedType(value)} aria-label="Token type">
                            <FormSelectOption value="github" label="Github" />
                            <FormSelectOption value="circle-ci" label="Circle CI" />
                            <FormSelectOption value="travis-ci" label="Travis CI" />
                        </FormSelect>
                    </FormGroup>
                    <FormGroup
                        isRequired
                        label="Secret"
                        fieldId="secret"
                        helperText="Please paste in your oauth token/secret"
                        labelIcon={
                            <Popover bodyContent="We will not store this token on our server, just encrypt it and store the keys for decryption. Keys are randomly generated, if you loose the encrypted value we are unable to encrypt it again.">
                                <button
                                    aria-label="More info for name field"
                                    onClick={(e) => e.preventDefault()}
                                    aria-describedby="secret"
                                    className="pf-c-form__group-label-help"
                                >
                                    <HelpIcon noVerticalAlign />
                                </button>
                            </Popover>
                        }
                    >
                        <TextInput
                            isRequired
                            type="password"
                            id="secret"
                            name="secret"
                            aria-describedby="secret"
                            value={formState['secret']}
                            onChange={(val) =>
                                setFormState({
                                    ...formState,
                                    secret: val,
                                })
                            }
                        />
                    </FormGroup>
                    <ActionGroup>
                        <Button
                            variant="primary"
                            onClick={(e) => {
                                e.preventDefault();
                                (async () => {
                                    const data = await (
                                        await fetch('/encrypt/token', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                secret: formState.secret,
                                                accName: formState['user-name'],
                                                repoSlug: formState['repo-slug'],
                                                type: selectedType,
                                            }),
                                        })
                                    ).json();
                                    setEncoded(data);
                                })();
                            }}
                        >
                            Encrypt
                        </Button>
                    </ActionGroup>
                </Form>
            </StackItem>
            <StackItem>
                <ClipboardCopy isReadOnly variant={ClipboardCopyVariant.expansion}>
                    {encoded}
                </ClipboardCopy>
            </StackItem>
        </Stack>
    );
};

export default NewToken;
