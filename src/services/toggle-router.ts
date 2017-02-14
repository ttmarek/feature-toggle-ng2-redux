import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';

import { IAppState } from '../store/store';
import { featureToggleConfigs } from '../toggle-config';
import { FeatureToggleActions } from '../actions/feature-toggle.actions';
import { IToggleRecord } from '../store/feature-toggle/feature-toggle.types';
import {
  IFeatureToggleConfig,
  IFeatureToggleConfigSet,
} from '../toggle-config/toggle.config.types';

@Injectable()
export class ToggleRouter {
  private static configs: IFeatureToggleConfigSet = featureToggleConfigs;
  private toggleConfig$: Observable<IToggleRecord>;
  private toggleRecord: IToggleRecord;

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private featureToggleActions: FeatureToggleActions
  ) {
    // TODO This cast might be dangerous
    this.toggleConfig$ = <Observable<IToggleRecord>>this.ngRedux.select('toggles');
    this.toggleConfig$.subscribe((toggleRecord: IToggleRecord) => {
      this.toggleRecord = toggleRecord;
    });
  }

  static getStateFromConfig(configs): any {
    return Object
      .keys(configs)
      .reduce((state, key) => Object.assign({}, state, { [key]: configs[key].setting }), {});
  }

  static getInitialState() {
    return this.getStateFromConfig(ToggleRouter.configs);
  }

  setFeatureState(featureState): void {
    this.featureToggleActions.toggleFeatureSetting(featureState);
  }

  getFeatureState(toggleId) {
    return this.toggleRecord.get(toggleId);
  }

  watch(toggleId: string): Observable<any> {
    // TODO: This will fire whenever any toggle changes,
    // fix it so it only fires when needed
    return this.toggleConfig$.map((configSet: IToggleRecord) => {
      return configSet.get(toggleId);
    });
  }
}