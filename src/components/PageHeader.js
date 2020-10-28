import React, { useState } from 'react';
import {
    PageHeader,
    PageHeaderTools,
    Dropdown,
    DropdownToggle,
    DropdownItem,
    DropdownSeparator,
    DropdownPosition,
    Text,
    TextVariants,
    Avatar,
} from '@patternfly/react-core';
import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { useAuth0 } from '@auth0/auth0-react';
import logo from '../static/logo_transparent_2.png';

const Header = ({ onNewInstallation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth0();
    return (
        <PageHeader
            logo={<img src={logo} alt="Logo" />}
            headerTools={
                <PageHeaderTools>
                    <Dropdown
                        position={DropdownPosition.right}
                        isPlain
                        isOpen={isOpen}
                        onSelect={() => setIsOpen(!isOpen)}
                        toggle={
                            <DropdownToggle id="toggle-id" onToggle={() => setIsOpen(!isOpen)} toggleIndicator={CaretDownIcon}>
                                <Avatar src={user?.picture} alt="avatar" />
                            </DropdownToggle>
                        }
                        dropdownItems={[
                            <DropdownItem key="new-organization" component="button" onClick={() => onNewInstallation()}>
                                <Text>New installation</Text>
                            </DropdownItem>,
                            <DropdownSeparator key="logout-separator" />,
                            <DropdownItem key="logout" className="ct-c-logout" component="button" onClick={() => logout()}>
                                <Text>Logout</Text>
                                <Text component={TextVariants.small}>({user?.nickname})</Text>
                            </DropdownItem>,
                        ]}
                    />
                </PageHeaderTools>
            }
        />
    );
};

export default Header;
