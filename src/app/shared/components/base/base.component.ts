import { Component, OnInit } from '@angular/core';

/**
 * @deprecated Use standalone components with inject() instead.
 * This class exists only for backward compatibility during FSD migration.
 * Theme is always null — views use Tailwind fallback classes.
 */
@Component({
  template: '',
})
export abstract class BaseComponent implements OnInit {
  theme: any = null;

  ngOnInit(): void {
    this.onComponentInit();
  }

  protected abstract onComponentInit(): void;
}
