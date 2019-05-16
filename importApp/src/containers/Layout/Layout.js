/* eslint-disable no-unused-vars */
import React from 'react';

import {
    LayoutWrapper,
    LayoutContainer,
    LayoutNav,
    LayoutFooter,
    LayoutFooterColumn,
    LayoutContent,
    LayoutContentColumn,
    LayoutHeader,
    AppTitle,
    RunningTitle,
    Content,
    ButtonContainer,
    Button
} from 'design-workshop';

const Layout = ({
  steps, 
  selectedStep, 
  onSetStep,
  children
}) => {
  return (
    <LayoutWrapper hasConfig>
      <LayoutHeader>
        <AppTitle>Ricardo Data App</AppTitle>
        <RunningTitle>{selectedStep.title}</RunningTitle>
      </LayoutHeader>
      <LayoutContainer>
        <LayoutContent>
          <LayoutContentColumn isConfig>
            {steps.map((step, index) => {
              const isSelectedStep = (selectedStep.id === step.id)
              const handleClickStep = () => onSetStep(step)
              return (
                <ButtonContainer key={index} >
                  <Button isColor={isSelectedStep ? "info" : null} onClick={handleClickStep}>
                    {step.name}
                  </Button>
                </ButtonContainer>)
              })
            }
          </LayoutContentColumn>
          <LayoutContentColumn isWorkspace>
            {children}
          </LayoutContentColumn>
        </LayoutContent>
        <LayoutFooter>
          <LayoutFooterColumn isSecondary>
            <h3>médialab SciencesPo</h3>
          </LayoutFooterColumn>
          <LayoutFooterColumn isPrimary>
            Ricardo Data App
          </LayoutFooterColumn>
        </LayoutFooter>
      </LayoutContainer>
    </LayoutWrapper>
  )
};

export default Layout;
