import { Component, ElementRef, Input, Output, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { DPlayerService } from './d-player.service';
import { DPlayerApiService } from './d-player-api.service';
import { Util } from '../util';
import DPlayer, {
  DPlayerAPIBackend,
  DPlayerContextMenuItem,
  DPlayerDanmaku,
  DPlayerEvents,
  DPlayerHighLightItem,
  DPlayerSubTitle,
  DPlayerVideo,
  Preload
} from 'dplayer';
import { mergeMap, switchMap, tap } from 'rxjs/operators';
import { from, iif, of } from 'rxjs';

@Component({
  selector: 'd-player',
  styles: [':host{display:block} :host ::ng-deep a{text-decoration:none}'],
  template: '{{ MESSAGE }}'
})
export class DPlayerComponent implements OnInit, OnDestroy {
  /**
   * Player Info
   * @property {string}
   */
  public MESSAGE = '';
  /**
   * Player Options
   * @property {any}
   */
  private _options: any = {
    container: null,
    apiBackend: {
      send: this.APIService.sendDanmaku.bind(this.APIService),
      read: this.APIService.readDanmaku.bind(this.APIService)
    },
    video: {},
  };

  /**
   * Player Options Attribute
   * @property {any}
   */
  @Input() set live(value: boolean) {
    this._options.live = Util.toBoolean(value);
  }

  get live(): boolean {
    return this._options.live;
  }

  @Input() set autoplay(value: boolean) {
    this._options.autoplay = Util.toBoolean(value);
  }

  get autoplay(): boolean {
    return this._options.autoplay;
  }

  @Input() set theme(value: string) {
    this._options.theme = value;
  }

  get theme(): string {
    return this._options.theme;
  }

  @Input() set loop(value: boolean) {
    this._options.loop = Util.toBoolean(value);
  }

  get loop(): boolean {
    return this._options.loop;
  }

  @Input() set lang(value: string) {
    this._options.lang = String(value);
  }

  get lang(): string {
    return this._options.lang;
  }

  @Input() set screenshot(value: boolean) {
    this._options.screenshot = Util.toBoolean(value);
  }

  get screenshot(): boolean {
    return this._options.screenshot;
  }

  @Input() set hotkey(value: boolean) {
    this._options.hotkey = Util.toBoolean(value);
  }

  get hotkey(): boolean {
    return this._options.hotkey;
  }

  @Input() set preload(value: Preload) {
    this._options.preload = value;
  }

  get preload(): Preload {
    return this._options.preload;
  }

  @Input() set volume(value: number) {
    this._options.volume = Util.toNumber(value, null);
  }

  get volume(): number {
    return this._options.volume;
  }

  @Input() set apiBackend(value: DPlayerAPIBackend) {
    this._options.apiBackend = value;
  }

  get apiBackend(): DPlayerAPIBackend {
    return this._options.apiBackend;
  }

  @Input() set mutex(value: boolean) {
    this._options.mutex = Util.toBoolean(value);
  }

  get mutex(): boolean {
    return this._options.mutex;
  }

  @Input() set video(value: DPlayerVideo) {
    this._options.video = value;
  }

  get video(): DPlayerVideo {
    return this._options.video;
  }

  @Input() set contextmenu(value: DPlayerContextMenuItem[]) {
    this._options.contextmenu = value;
  }

  get contextmenu(): DPlayerContextMenuItem[] {
    return this._options.contextmenu;
  }

  @Input() set src(value: string) {
    this._options.video.url = String(value);
  }

  get src(): string {
    return this._options.video.url;
  }

  @Input() set poster(value: string) {
    this._options.video.pic = String(value);
  }

  get poster(): string {
    return this._options.video.pic;
  }

  @Input() set subtitle(value: DPlayerSubTitle) {
    this._options.subtitle = value;
  }

  get subtitle(): DPlayerSubTitle {
    return this._options.subtitle;
  }

  @Input() set danmaku(value: DPlayerDanmaku) {
    this._options.danmaku = value;
  }

  get danmaku(): DPlayerDanmaku {
    return this._options.danmaku;
  }

  @Input() set highlight(value: DPlayerHighLightItem[]) {
    this._options.highlight = value;
  }

  get highlight(): DPlayerHighLightItem[] {
    return this._options.highlight;
  }

  /**
   * Player ID
   * @property {number}
   */
  public PID = -1;
  /**
   * Player Instance
   * @property {DPlayer}
   */
  public PLAYER: DPlayer = null;
  /**
   * Media Source Extensions
   * @property {any}
   */
  public MSE: any[] = [];

  [key: string]: any;

  /**
   * Player Events
   * @property {EventEmitter}
   */
    // @Output() private screenshotChange: EventEmitter<void> = new EventEmitter;
  @Output() private thumbnails_show: EventEmitter<void> = new EventEmitter;
  @Output() private thumbnails_hide: EventEmitter<void> = new EventEmitter;
  @Output() private danmaku_show: EventEmitter<void> = new EventEmitter;
  @Output() private danmaku_hide: EventEmitter<void> = new EventEmitter;
  @Output() private danmaku_clear: EventEmitter<void> = new EventEmitter;
  @Output() private danmaku_loaded: EventEmitter<void> = new EventEmitter;
  @Output() private danmaku_send: EventEmitter<void> = new EventEmitter;
  @Output() private danmaku_opacity: EventEmitter<void> = new EventEmitter;
  @Output() private contextmenu_show: EventEmitter<void> = new EventEmitter;
  @Output() private contextmenu_hide: EventEmitter<void> = new EventEmitter;
  @Output() private notice_show: EventEmitter<void> = new EventEmitter;
  @Output() private notice_hide: EventEmitter<void> = new EventEmitter;
  @Output() private quality_start: EventEmitter<void> = new EventEmitter;
  @Output() private quality_end: EventEmitter<void> = new EventEmitter;
  @Output() private destroy: EventEmitter<void> = new EventEmitter;
  @Output() private resize: EventEmitter<void> = new EventEmitter;
  @Output() private fullscreen: EventEmitter<void> = new EventEmitter;
  @Output() private fullscreen_cancel: EventEmitter<void> = new EventEmitter;
  @Output() private webfullscreen: EventEmitter<void> = new EventEmitter;
  @Output() private webfullscreen_cancel: EventEmitter<void> = new EventEmitter;
  @Output() private subtitle_show: EventEmitter<void> = new EventEmitter;
  @Output() private subtitle_hide: EventEmitter<void> = new EventEmitter;
  @Output() private subtitle_change: EventEmitter<void> = new EventEmitter;
  /**
   * Video Events
   * @property {EventEmitter}
   */
  @Output() private abort: EventEmitter<void> = new EventEmitter;
  @Output() private canplay: EventEmitter<void> = new EventEmitter;
  @Output() private canplaythrough: EventEmitter<void> = new EventEmitter;
  @Output() private durationchange: EventEmitter<void> = new EventEmitter;
  @Output() private emptied: EventEmitter<void> = new EventEmitter;
  @Output() private ended: EventEmitter<void> = new EventEmitter;
  @Output() private error: EventEmitter<void> = new EventEmitter;
  @Output() private loadeddata: EventEmitter<void> = new EventEmitter;
  @Output() private loadedmetadata: EventEmitter<void> = new EventEmitter;
  @Output() private loadstart: EventEmitter<void> = new EventEmitter;
  @Output() private mozaudioavailable: EventEmitter<void> = new EventEmitter;
  // @Output() private pause: EventEmitter<void> = new EventEmitter;
  // @Output() private play: EventEmitter<void> = new EventEmitter;
  @Output() private playing: EventEmitter<void> = new EventEmitter;
  @Output() private progress: EventEmitter<void> = new EventEmitter;
  @Output() private ratechange: EventEmitter<void> = new EventEmitter;
  @Output() private seeked: EventEmitter<void> = new EventEmitter;
  @Output() private seeking: EventEmitter<void> = new EventEmitter;
  @Output() private stalled: EventEmitter<void> = new EventEmitter;
  @Output() private suspend: EventEmitter<void> = new EventEmitter;
  @Output() private timeupdate: EventEmitter<void> = new EventEmitter;
  // @Output() private volumeChange: EventEmitter<void> = new EventEmitter;
  // @Output() private waitin: EventEmitter<void> = new EventEmitter;

  constructor(
    private ElemRef: ElementRef,
    private DPService: DPlayerService,
    private APIService: DPlayerApiService
  ) {
  }

  ngOnInit() {
    this.initCustomType()
      .pipe(
        mergeMap((mse) => {
          Object.assign(this.video, mse);
          return this.initPlayer();
        })
      )
      .subscribe(_dp => this.PLAYER = _dp,
        () => this.MESSAGE = 'initialization error',
        () => this.PID = this.DPService.pid)
      .unsubscribe();
  }

  private initCustomType() {
    return iif(
      () => this.MSE.length > 0,
      from(this.MSE)
        .pipe(
          switchMap(mse => of({
            type: 'MSE',
            customType: {
              MSE: mse
            }
          }))
        ),
      of({})
    );
  }

  private initPlayer() {
    this._options.container = this.ElemRef.nativeElement;
    return this.DPService.createPlayer(this._options)
      .pipe(tap((_dp) => {
        Object.keys(_dp.events).forEach((item) => {
          if (item !== 'events') {
            _dp.events[item].forEach((event: DPlayerEvents) => {
              if (this[event] && this[event].observers.length > 0) {
                _dp.on(event, () => this[event].emit());
              } else if (this[event] && this[event].unsubscribe) {
                this[event].unsubscribe();
                delete this[event];
              }
            });
          }
        });
        Object.getOwnPropertyNames(_dp).forEach(key => {
          Object.defineProperty(this, key, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: _dp[key]
          });
        });
        _dp.play = _dp.play.bind(_dp);
        Object.getOwnPropertyNames(Object.getPrototypeOf(_dp)).forEach(key => {
          Object.defineProperty(Object.getPrototypeOf(this), key, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: _dp[key]
          });
        });
      }));
  }

  ngOnDestroy() {
    this.DPService.destroyPlayer(this.PLAYER)
      .subscribe()
      .unsubscribe();
  }
}
